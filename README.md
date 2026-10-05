# tic-tac-go-server

Tic Tac Go is a real-time, online multiplayer tic-tac-toe game. This repository contains the game server, built with NestJS and Socket.IO. It manages rooms, validates moves, decides winners and draws, handles player disconnections and reconnections, and supports rematches, so two players can play against each other from different browsers.

- Website using this server: https://tic-tac-go-teal.vercel.app/
- Frontend repository: https://github.com/RizziSilva/tic-tac-go

## Tech stack

- NestJS
- Socket.IO (WebSocket gateway)
- TypeScript

## Getting started

```bash
npm install
npm run start:dev
```

The server listens on the port defined by the `PORT` environment variable (defaults to `3000`).

## Scripts

| Command              | Description            |
| -------------------- | ---------------------- |
| `npm run start:dev`  | Start in watch mode    |
| `npm run build`      | Build the project      |
| `npm run start:prod` | Run the compiled build |

## Socket events

Client to server: `create_room`, `join_room_with_code`, `rejoin_room`, `move`, `leave_room`, `request_rematch`, `decline_rematch`.

Server to client: `room_created`, `room_joined`, `player_joined`, `room_state`, `move_made`, `game_over`, `opponent_disconnected`, `opponent_reconnected`, `rematch_requested`, `rematch_started`, `rematch_declined`.
