from .base import BaseReadOnlyViewSet
from.auth import LoginView,MeView,RefreshTokenView,RegisterView,ChangePasswordView
from .lesson import CourseViewSet, LessonViewSet
from .vocabulary import VocabularyViewSet, KanjiViewSet
from .grammar import GrammarViewSet
from .quiz import QuizViewSet
from .progress import UserProgressViewSet
from .bookmark import BookmarkViewSet
from .flashcard import FlashcardReviewViewSet
from .quiz_result import QuizResultViewSet
from .assistant import AssistantChatView