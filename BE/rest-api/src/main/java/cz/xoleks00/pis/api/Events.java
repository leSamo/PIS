package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.List;

import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.service.EventManager;

@Path("/events")
public class Events {
    @Inject
    private EventManager evntMgr;
    @Context
    private UriInfo context;

    public Events() {
    }

    @PostConstruct
    public void init() {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Event> getEvents() {
        return evntMgr.findAll();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addEvent(Event event) {
        Event savedEvent = evntMgr.save(event);
        final URI uri = UriBuilder.fromPath("/events/{resourceServerId}").build(savedEvent.getId());
        return Response.created(uri).entity(savedEvent).build();
    }
}

