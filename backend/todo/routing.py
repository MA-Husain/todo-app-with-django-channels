from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/todo/(?P<list_id>\w+)/$', consumers.TodoConsumer.as_asgi()),
]
