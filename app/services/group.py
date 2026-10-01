import re

from app.exceptions import GroupNotFoundError
from app.repositories.group import GroupRepository
from app.schemas import GroupCreate, GroupRead

# ==================== ГЕНЕРАЦИЯ SLUG ====================
# Транслитерация русских букв в латиницу
TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def slugify(text: str) -> str:
    """
    Превращает 'Программирование на Python' в 'programmirovanie-na-python'.
    Используется для автогенерации slug из title.
    """
    text = text.lower()
    result = []
    for char in text:
        if char in TRANSLIT_MAP:
            result.append(TRANSLIT_MAP[char])
        elif char.isalnum():
            result.append(char)
        else:
            result.append('-')
    slug = ''.join(result)
    # Убираем повторяющиеся дефисы и дефисы по краям
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug or 'group'


# ==================== СЕРВИС ====================
class GroupService:
    def __init__(self, group_repo: GroupRepository):
        self.group_repo = group_repo

    async def get_all_groups(self) -> list[GroupRead]:
        groups = await self.group_repo.get_all()
        return [GroupRead.model_validate(g) for g in groups]

    async def get_group_by_slug(self, slug: str) -> GroupRead:
        group = await self.group_repo.get_by_slug(slug)
        if not group:
            raise GroupNotFoundError("Сообщество не найдено")
        return GroupRead.model_validate(group)

    # НОВЫЙ МЕТОД: создание сообщества
    async def create_group(self, form: GroupCreate) -> GroupRead:
        # Генерируем slug из title, если он не задан вручную
        slug = form.slug.strip() if form.slug else slugify(form.title)

        # Проверяем, что такого slug еще нет; если есть — добавляем суффикс
        existing = await self.group_repo.get_by_slug(slug)
        if existing:
            counter = 1
            base_slug = slug
            while existing:
                slug = f"{base_slug}-{counter}"
                existing = await self.group_repo.get_by_slug(slug)
                counter += 1

        group = await self.group_repo.create(
            title=form.title,
            slug=slug,
            description=form.description,
        )
        return GroupRead.model_validate(group)
