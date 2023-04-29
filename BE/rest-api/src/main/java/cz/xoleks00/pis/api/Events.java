package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.List;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.UserManager;
import jakarta.ws.rs.DELETE;

@Path("/events")
public class Events {
    @Inject
    private EventManager evntMgr;
    @Inject
    private UserManager userMgr; // Added UserManager to verify PISUser existence
    @Context
    private UriInfo context;

    public Events() {
    }

    @PostConstruct
    public void init() {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public List<Event> getEvents() {
        return evntMgr.findAll();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response addEvent(Event event) {
        if (userMgr.find(event.getCreator().getId()) == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity("PISUser with the provided ID does not exist.")
                           .build();
        }
        Event savedEvent = evntMgr.save(event);
        final URI uri = UriBuilder.fromPath("/events/{resourceServerId}").build(savedEvent.getId());
        return Response.created(uri).entity(savedEvent).build();
    }

    @GET
    @Path("/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public List<Event> getEventsForUser(@PathParam("userId") long userId) {
        return evntMgr.findEventsByUserId(userId);
    }


    @DELETE
    @Path("/{id}")
    @RolesAllowed({ "admin", "employee" })
    public Response deleteEvent(@PathParam("id") long id) {
        Event event = evntMgr.findById(id);
        if (event == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Event not found for ID: " + id).build();
        }
        evntMgr.removeById(id);
        return Response.noContent().build();
    }


}
