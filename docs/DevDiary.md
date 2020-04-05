# Dev Diary

## [[Pre-0.0.1]]: The way to a working prototype

### Communication of nodes

As previously stated in the README, this whole project is to be observed as learning process.
I **do not expect** to create a newly full-framed 'Microservice Tooling'.
There are thousand other more sophisticated alternatives, e.g. [Moleculer] or working with [Kubernetes] and [Istio].
Therefore _of course_ I'll try to develop most parts from scratch.
**Like literally.**

Even the communication between the nodes ain't a standardized protocol.
Yes, I'm not using HTTP, [NATS], [MQTT](http://mqtt.org/) or whatsoever.
The nodes will be bare TCP server.
You may ask yourself: 'What about security'? - Yea don't expect this in any versions before any mayor releases.
I start only by using my services inside local networks, as this is the only reasonable Use case right now.

Working with TCP server leaved me with some new challenges I'll have to solve.

**First: TCP means connections in form of sockets.**
I don't plan to maintain a persistent connections between my µHome nodes.
I'll have to develop a way to [send packages] between nodes, i.e. build up a connection, send the package, end the connection.

**Second: No standardized protocol.**
That means, I'll have to create my own protocol which represents the standard communication structure of a package.
I solved this by [defining a simple protocol], based on a HEADER and a PAYLOAD.
The payload is (when parsed) a JSON object.\
Also ignore the v2 comment of using CloudEvent.
I removed that idea quite quickly.
Yes I try to version the protocol functions.
Later in my progression I'll want to deep dive more into the description and development of the protocol.

With that defined, I had a way to develop reproducible ['services'](nodes) with some common basic structures (like the TCP server).

### Event based communication

It may not be quite obvious, but every node will have the ability to subscribe to events that will be published (or broadcast) inside the service mesh.
Therefore I work a lot with the [EventEmitter] class.
Every `services` contains beside the named TCP server an internalEventEmitter.\
My protocol per definition defines the `type` property, which describes what event the payload describes.
When a package will be received by **any** node of the mesh it checks if it has a [subscribed event handler] for this type.
If not it'll simply respond with a ['No event handler registered'] message.

Using this internal event emitter, the services will process every incoming package.
An event for example could be `µHome.healthcheck`, which every node would have to implement by it's own.
Later a user can define any structure he wants, e.g. `storage.save` subscribed by a 'storage' microservice which will save any incoming payload.

### Developing the 'Core API'

As said, my goal was to create something like a framework to develop microservices.
So I started thinking about what could define the core of the API.
I started to develop core nodes, that every 'µHome Service Mesh' will need.
Namely the [`Event Broker`] and [`Service Registry`].

### The Service Registry

A service registry inside the 'µHome Service Mesh' is a node, that will keep the state of every active node inside the mesh.
It will have a list of every node saved with a `nodeId` and it's local IPv4 address (plus port obviously).
For some resilience I didn't use a simple javascript object, but a [in-memory database called nedb].\
Further below, I append a simple sequence diagram that describes the flow of a registration by any node inside the service mesh.

![Sequence Diagram: Registration](./images/0.0.1_RegisterSequence.png)

1. When a node is starting, it'll send a register event to service registry. it contains the nodeID and it's ip address
2. (Step 2 and 3 actually are exchanged later): The registry will save the node to the in-memory database
3. The registry is responsible for performing a healthcheck to check if the node actually is alive.
   It'll also check if the node isn't already registered.
4. After all that, the registry will notify the event broker, that a new node is added to the registry.

### The Event Broker

The event broker represents one of the most important nodes in a 'µHome Service Mesh'.
It'll publish and broadcast events that are triggered by different sources.
For example a microservice could publish a event while processing any other independent event, so that any other microservice could continue work on this event.
Another way could be a type of interface (e.g. HTTP or MQTT) that triggers the event broker to kind of "forward" the incoming event.\
In the first iteration I'll try to implement a REPL like tool, so that I can easily inject events into the mesh.
This will greatly help debugging any node.

---

## [[0.0.1]]: The first working prototype

Today I achieved the first working iteration of the Core API.
Using the [index.js], [dummyService.js] and [dummyService2.js] I'm able to create a mesh, that contains two services, a service registry and event broker.
The `dummyService` will subscribe to a `local.test` event.
Currently only logging the payload.
`dummyService2` actually doesn't subscribe to any event.

### Next steps

Before starting to implement any services I'll continue in improving the Core API.
Currently it may only be understandable by me.
I'll try to abstract more of the communication parts, e.g. right now the combination of (microHomeMessage, createPayload) is pretty redundant.
Also I need to improve the way, function arguments are passed by the user and of course the whole documentation needs a bit of work.

These will be my tasks for the next days, and hopefully achieving version 0.0.2.
I'll keep you informed.

---

[pre-0.0.1]: https://github.com/ChimiDEV/microHome/tree/1827554d037721375fed868136296ea925f48c6f
[0.0.1]: https://github.com/ChimiDEV/microHome/tree/v0.0.1
[nats]: https://nats.io/
[moleculer]: https://moleculer.services/
[kubernetes]: https://kubernetes.io/
[istio]: https://istio.io/
[send packages]: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/network.js#L18
[defining a simple protocol]: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/protocol.js
['services']: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/service.js#L26
[eventemitter]: https://nodejs.org/api/events.html#events_class_eventemitter
[subscribed event handler]: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/service.js#L62
['no event handler registered']: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/service.js#L45
[`event broker`]: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/eventBroker.js
[`service registry`]: https://github.com/ChimiDEV/microHome/blob/1827554d037721375fed868136296ea925f48c6f/src/core/serviceRegistry.js
[in-memory database called nedb]: https://github.com/louischatriot/nedb
[index.js]: https://github.com/ChimiDEV/microHome/blob/v0.0.1/src/index.js
[dummyservice.js]: https://github.com/ChimiDEV/microHome/blob/v0.0.1/src/dummyService.js
[dummyservice2.js]: https://github.com/ChimiDEV/microHome/blob/v0.0.1/src/dummyService2.js
