# todo/views.py
from rest_framework import viewsets, permissions
from . import serializers, models

class TodoViewSet(viewsets.ModelViewSet):
    queryset = models.Todo.objects.all()
    serializer_class = serializers.TodoSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return models.Todo.objects.filter(user=self.request.user)
