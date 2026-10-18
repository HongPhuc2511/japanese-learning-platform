from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin, UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin, StackedInline, TabularInline
from unfold.contrib.filters.admin import ChoicesDropdownFilter, RelatedDropdownFilter
from unfold.decorators import display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .models import (
    Answer,
    Bookmark,
    Course,
    FlashcardReview,
    Grammar,
    Kanji,
    Lesson,
    Question,
    Quiz,
    QuizResult,
    User,
    UserProgress,
    Vocabulary,
)

# Standard High-Contrast JLPT Badges:
# N1: Red (danger), N2: Orange (warning), N3: Purple/Crimson (primary), N4: Blue (info), N5: Green (success)
JLPT_BADGE_COLORS = {
    "N1": "danger",
    "N2": "warning",
    "N3": "primary",
    "N4": "info",
    "N5": "success",
}

# Re-register Group with Unfold styling
admin.site.unregister(Group)


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


# User Admin
@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    list_display = [
        "username",
        "email",
        "level_badge",
        "streak_count",
        "points",
        "is_staff",
        "is_active",
    ]
    list_filter = [
        ("level", ChoicesDropdownFilter),
        "is_staff",
        "is_superuser",
        "is_active",
    ]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["username"]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            _("Thông tin cá nhân"),
            {"fields": ("first_name", "last_name", "email", "avatar")},
        ),
        (
            _("Học tập & Tiến trình"),
            {"fields": ("level", "streak_count", "last_study_date", "points")},
        ),
        (
            _("Quyền hạn"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Thời gian"), {"fields": ("last_login", "date_joined")}),
    )

    @display(description=_("Trình độ"), label=JLPT_BADGE_COLORS)
    def level_badge(self, obj):
        return obj.level


# Inlines
class LessonInline(TabularInline):
    model = Lesson
    extra = 1
    fields = ["order", "title"]
    show_change_link = True


class AnswerInline(TabularInline):
    model = Answer
    extra = 4
    fields = ["answer_text", "is_correct"]


class QuestionInline(StackedInline):
    model = Question
    extra = 1
    fields = ["question_text", "question_type", "audio"]
    show_change_link = True


# Course & Lesson
@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ["order", "title", "level_badge", "lessons_count", "created_at"]
    list_display_links = ["title"]
    list_filter = [("level", ChoicesDropdownFilter)]
    search_fields = ["title", "description"]
    ordering = ["order", "id"]
    inlines = [LessonInline]

    @display(description=_("Cấp độ JLPT"), label=JLPT_BADGE_COLORS)
    def level_badge(self, obj):
        return obj.level

    @display(description=_("Số bài học"))
    def lessons_count(self, obj):
        return obj.lessons.count()


@admin.register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = [
        "order",
        "title",
        "course",
        "vocab_count",
        "grammar_count",
        "quiz_count",
        "created_at",
    ]
    list_display_links = ["title"]
    list_filter = [("course", RelatedDropdownFilter)]
    search_fields = ["title", "content", "course__title"]
    ordering = ["course", "order"]

    @display(description=_("Từ vựng"))
    def vocab_count(self, obj):
        return obj.vocabularies.count()

    @display(description=_("Ngữ pháp"))
    def grammar_count(self, obj):
        return obj.grammars.count()

    @display(description=_("Quiz"))
    def quiz_count(self, obj):
        return obj.quizzes.count()


# Language Models
@admin.register(Vocabulary)
class VocabularyAdmin(ModelAdmin):
    list_display = [
        "word",
        "kana",
        "romaji",
        "meaning",
        "level_badge",
        "lesson",
        "has_audio",
    ]
    list_display_links = ["word"]
    list_filter = [
        ("level", ChoicesDropdownFilter),
        ("lesson__course", RelatedDropdownFilter),
        ("lesson", RelatedDropdownFilter),
    ]
    search_fields = [
        "word",
        "kana",
        "romaji",
        "meaning",
        "example_sentence",
        "example_meaning",
    ]
    ordering = ["level", "word"]

    @display(description=_("Cấp độ"), label=JLPT_BADGE_COLORS)
    def level_badge(self, obj):
        return obj.level

    @display(description=_("Audio"), boolean=True)
    def has_audio(self, obj):
        return bool(obj.audio)


@admin.register(Kanji)
class KanjiAdmin(ModelAdmin):
    list_display = [
        "character_display",
        "meaning",
        "onyomi",
        "kunyomi",
        "stroke_count",
        "level_badge",
        "radical",
    ]
    list_display_links = ["character_display"]
    list_filter = [("jlpt_level", ChoicesDropdownFilter)]
    search_fields = ["character", "meaning", "onyomi", "kunyomi", "radical"]
    ordering = ["jlpt_level", "stroke_count"]

    @display(description=_("Chữ Hán (Kanji)"), ordering="character")
    def character_display(self, obj):
        return format_html(
            '<div class="kanji-character-cell font-japanese">{}</div>',
            obj.character,
        )

    @display(description=_("JLPT"), label=JLPT_BADGE_COLORS)
    def level_badge(self, obj):
        return obj.jlpt_level


@admin.register(Grammar)
class GrammarAdmin(ModelAdmin):
    list_display = ["title", "level_badge", "lesson", "created_at"]
    list_display_links = ["title"]
    list_filter = [
        ("level", ChoicesDropdownFilter),
        ("lesson", RelatedDropdownFilter),
    ]
    search_fields = ["title", "explanation", "example_sentence"]
    ordering = ["level", "title"]

    @display(description=_("JLPT"), label=JLPT_BADGE_COLORS)
    def level_badge(self, obj):
        return obj.level


# Quiz Models
@admin.register(Quiz)
class QuizAdmin(ModelAdmin):
    list_display = ["title", "lesson", "questions_count", "created_at"]
    list_display_links = ["title"]
    list_filter = [("lesson", RelatedDropdownFilter)]
    search_fields = ["title", "lesson__title"]
    inlines = [QuestionInline]

    @display(description=_("Số câu hỏi"))
    def questions_count(self, obj):
        return obj.questions.count()


@admin.register(Question)
class QuestionAdmin(ModelAdmin):
    list_display = [
        "question_text",
        "quiz",
        "question_type_badge",
        "answers_count",
        "has_audio",
    ]
    list_display_links = ["question_text"]
    list_filter = [
        ("question_type", ChoicesDropdownFilter),
        ("quiz", RelatedDropdownFilter),
    ]
    search_fields = ["question_text", "quiz__title"]
    inlines = [AnswerInline]

    @display(
        description=_("Loại câu hỏi"),
        label={
            "multiple_choice": "info",
            "listening": "warning",
            "reading": "success",
        },
    )
    def question_type_badge(self, obj):
        return obj.question_type

    @display(description=_("Số đáp án"))
    def answers_count(self, obj):
        return obj.answers.count()

    @display(description=_("Audio"), boolean=True)
    def has_audio(self, obj):
        return bool(obj.audio)


@admin.register(Answer)
class AnswerAdmin(ModelAdmin):
    list_display = ["answer_text", "question", "is_correct"]
    list_display_links = ["answer_text"]
    list_filter = ["is_correct", ("question__quiz", RelatedDropdownFilter)]
    search_fields = ["answer_text", "question__question_text"]


@admin.register(QuizResult)
class QuizResultAdmin(ModelAdmin):
    list_display = ["user", "quiz", "score_display", "completed_at"]
    list_filter = [("quiz", RelatedDropdownFilter)]
    search_fields = ["user__username", "user__email", "quiz__title"]
    ordering = ["-completed_at"]

    @display(description=_("Điểm số"))
    def score_display(self, obj):
        return f"{obj.score:.1f}%"


# Progress & SRS
@admin.register(UserProgress)
class UserProgressAdmin(ModelAdmin):
    list_display = ["user", "lesson", "is_completed", "completed_at", "updated_at"]
    list_filter = ["is_completed", ("lesson", RelatedDropdownFilter)]
    search_fields = ["user__username", "user__email", "lesson__title"]


@admin.register(FlashcardReview)
class FlashcardReviewAdmin(ModelAdmin):
    list_display = [
        "user",
        "content_type",
        "object_id",
        "interval_days",
        "ease_factor",
        "review_count",
        "next_review_date",
    ]
    list_filter = ["content_type"]
    search_fields = ["user__username", "user__email"]
    ordering = ["next_review_date"]


@admin.register(Bookmark)
class BookmarkAdmin(ModelAdmin):
    list_display = ["user", "content_type", "object_id", "created_at"]
    list_filter = ["content_type"]
    search_fields = ["user__username", "user__email"]
    ordering = ["-created_at"]
