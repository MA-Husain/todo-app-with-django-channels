# todo/urls.py
from rest_framework.routers import DefaultRouter
from .views import TodoListViewSet, TodoItemViewSet, SharedTodoListViewSet, TodoListPermissionView
from django.urls import path



router = DefaultRouter()
router.register('lists', TodoListViewSet, basename='lists')
router.register('items', TodoItemViewSet, basename='items')
router.register('shared-todolists', SharedTodoListViewSet, basename='shared-todolists')

urlpatterns = router.urls 
urlpatterns += [
    path('lists/<int:pk>/permission/', TodoListPermissionView.as_view()),
]
