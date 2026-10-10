from .base import BaseSerializer
from .auth import CustomTokenObtainPairSerializer,RegisterSerializer,UserSerializer,ChangePasswordSerializer, GoogleLoginSerializer
from .lesson import CourseSerializer, CourseDetailSerializer, LessonSerializer, LessonDetailSerializer
from .vocabulary import VocabularySerializer, KanjiSerializer
from .grammar import GrammarSerializer
from .quiz import (
    QuizSerializer, QuizDetailSerializer, QuestionSerializer, AnswerSerializer,
    QuizSubmitSerializer, QuizResultSerializer
)
from .progress import UserProgressSerializer
from .bookmark import BookmarkSerializer
from .flashcard import FlashcardReviewSerializer
from .assistant import ChatRequestSerializer

