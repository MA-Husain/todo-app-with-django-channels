from rest_framework import viewsets, permissions, serializers, status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from .models import TodoList, TodoItem, SharedTodoList
from .serializers import TodoListSerializer, TodoItemSerializer, SharedTodoListSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied



User = get_user_model()


class TodoListViewSet(viewsets.ModelViewSet):
    queryset = TodoList.objects.all()
    serializer_class = TodoListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only owner's own lists in listing endpoints
        return TodoList.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Allow owner OR shared user to retrieve a list."""
        list_id = kwargs.get('pk')
        try:
            # Try to get as owner
            todo_list = TodoList.objects.get(pk=list_id, owner=request.user)
        except TodoList.DoesNotExist:
            # Try to get as shared user
            try:
                shared = SharedTodoList.objects.get(todo_list_id=list_id, user=request.user)
                todo_list = shared.todo_list  # <- accessible if shared
            except SharedTodoList.DoesNotExist:
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(todo_list)
        return Response(serializer.data)



class TodoItemViewSet(viewsets.ModelViewSet):
    serializer_class = TodoItemSerializer
    queryset = TodoItem.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        list_id = self.request.query_params.get('todo_list')
        if list_id:
            queryset = queryset.filter(todo_list_id=list_id)
        return queryset

    def perform_create(self, serializer):
        todo_list = serializer.validated_data.get('todo_list')
        user = self.request.user

        # Owner can create
        if todo_list.owner == user:
            serializer.save()
            return

        # Check if user has shared edit permission
        shared = SharedTodoList.objects.filter(user=user, todo_list=todo_list).first()
        if shared and shared.permission == 'edit':
            serializer.save()
            return

        # Otherwise: reject
        raise PermissionDenied("You do not have permission to add items to this list.")
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        todo_list = instance.todo_list
        user = request.user

        if todo_list.owner == user:
            return super().update(request, *args, **kwargs)

        shared = SharedTodoList.objects.filter(todo_list=todo_list, user=user).first()
        if shared and shared.permission == 'edit':
            return super().update(request, *args, **kwargs)

        raise PermissionDenied("You do not have permission to edit this item.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        todo_list = instance.todo_list
        user = request.user

        if todo_list.owner == user:
            return super().destroy(request, *args, **kwargs)

        shared = SharedTodoList.objects.filter(todo_list=todo_list, user=user).first()
        if shared and shared.permission == 'edit':
            return super().destroy(request, *args, **kwargs)

        raise PermissionDenied("You do not have permission to delete this item.")



class SharedTodoListViewSet(viewsets.ModelViewSet):
    serializer_class = SharedTodoListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        list_id = self.request.query_params.get('list_id')
        shared_with_me = self.request.query_params.get('shared_with_me')

        if list_id:
            try:
                todo_list = TodoList.objects.get(pk=list_id)
            except TodoList.DoesNotExist:
                return SharedTodoList.objects.none()

            # Owner is viewing all shares for a list they own
            if todo_list.owner == user:
                return SharedTodoList.objects.filter(todo_list_id=list_id)

        # ✅ NEW: For dashboard - only lists shared *with* me
        if shared_with_me == 'true':
            return SharedTodoList.objects.filter(user=user)

        # Default: lists I own OR shared with me
        return SharedTodoList.objects.filter(todo_list__owner=user) | SharedTodoList.objects.filter(user=user)



    def perform_create(self, serializer):
        email = self.request.data.get('shared_with_email')

        if not email:
            raise serializers.ValidationError("Email is required.")

        # ✅ Prevent self-sharing
        if email.lower() == self.request.user.email.lower():
            raise serializers.ValidationError("You cannot share a list with yourself.")

        try:
            shared_user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        todo_list_id = self.request.data.get('todo_list')
        if not todo_list_id:
            raise serializers.ValidationError("Todo list ID is required.")

        # ✅ Prevent duplicate share
        if SharedTodoList.objects.filter(user=shared_user, todo_list_id=todo_list_id).exists():
            raise serializers.ValidationError("This user already has access to the list.")

        serializer.save(user=shared_user, todo_list_id=todo_list_id)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Only list owner can update share
        if instance.todo_list.owner != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Only list owner can unshare
        if instance.todo_list.owner != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
    
    def get_object(self):
        obj = super().get_object()
        # Ensure only the owner of the list can update/delete
        if obj.todo_list.owner != self.request.user:
            raise PermissionDenied("You do not have permission to modify this sharing.")
        return obj




class TodoListPermissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            todo_list = TodoList.objects.get(pk=pk)
        except TodoList.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if todo_list.owner == request.user:
            return Response({
                'permission': 'edit',
                'is_owner': True
            })

        shared = SharedTodoList.objects.filter(user=request.user, todo_list=todo_list).first()
        if shared:
            return Response({
                'permission': shared.permission,
                'is_owner': False
            })

        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
