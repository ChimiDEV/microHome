# µHome - A Home Managing and Automation Service

Microservice Based Home Managing and Automation Service

## Brainstorming

Surely there are tons of other ready-to-go microservices frameworks with already built-in service registries and what not.
This project purely is for learning something new, while also implementing something of value for myself.

Simple idea is a service/product/app (call it the frick you want) that contains some features managing my home (or even automate some stuff)
Easiest use case right now, I could think of is a simple storage/state service, that keeps track of food/drink at home (and when I may have open them).

There may come other stuff in my mind, which implies a scaleable and modular architecture. Therefore I want to go and try implement a "kinda full-blown" microservice event-driven architecture myself.

I'll start with an centralized event broker. But maybe one day I'll try and restart using a decentralized architecture.

- https://medium.com/@nikolaystoykov/build-custom-protocol-on-top-of-tcp-with-node-js-part-1-fda507d5a262
- https://pusher.com/tutorials/service-discovery-microservices
- https://medium.com/codait/simple-service-registry-4550aee5a869

For further information about the current state, you can check the ['Dev Diary'](./docs/DevDiary.md) I try to maintain.
