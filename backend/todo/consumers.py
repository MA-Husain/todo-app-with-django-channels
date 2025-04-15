from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class TodoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.list_id = self.scope['url_route']['kwargs']['list_id']
        self.room_group_name = f'todo_{self.list_id}'

        self.user = self.scope['user']
        print("Connect: user =", self.scope["user"])
        if self.scope["user"].is_anonymous:
            print("Anonymous user, closing connection.")
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")

        if self.user.is_anonymous:
            print("Anonymous user, closing connection.")
            await self.close()
            return  # optionally close or ignore

        if event_type == "todo_created":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "todo.created",
                    "todo": data["todo"],
                }
            )
        elif event_type == "todo_updated":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "todo.updated",
                    "todo": data["todo"],
                }
            )
        elif event_type == "todo_deleted":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "todo.deleted",
                    "todo_id": data["todo_id"],
                }
            )


    async def todo_created(self, event):
        await self.send(text_data=json.dumps({
            "type": "todo_created",
            "todo": event["todo"],
        }))

    async def todo_updated(self, event):
        await self.send(text_data=json.dumps({
            "type": "todo_updated",
            "todo": event["todo"],
        }))

    async def todo_deleted(self, event):
        await self.send(text_data=json.dumps({
            "type": "todo_deleted",
            "todo_id": event["todo_id"],
        }))
