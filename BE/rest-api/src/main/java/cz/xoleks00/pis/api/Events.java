package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.core.Response.Status;
import cz.xoleks00.pis.data.CreateEventRequest;
import cz.xoleks00.pis.data.ErrorDTO;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.EventDTO;
import cz.xoleks00.pis.data.Notification;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.data.UserDTO;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.NotificationManager;
import cz.xoleks00.pis.service.UserManager;
import jakarta.ws.rs.DELETE;

@Path("/events")
public class Events {
    @Inject
    private EventManager evntMgr;
    @Inject
    private UserManager userMgr; 
    @Inject
    private NotificationManager ntfMgr; 
    @Context
    private UriInfo context;
    @Context
    private SecurityContext securityContext;

    public Events() {
    }

    @PostConstruct
    public void init() {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin", "employee"})
    public Response getEvents(@QueryParam("start_date") String startDate, @QueryParam("end_date") String endDate, @QueryParam("users") List<String> users) {
        // Check if all usernames exist in the database
        if (users != null && !users.isEmpty()) {
            for (String username : users) {
                if (userMgr.findByUsername(username) == null) {
                    ErrorDTO errorDTO = new ErrorDTO("Username not found: " + username);
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(errorDTO)
                            .type(MediaType.APPLICATION_JSON)
                            .build();
                }
            }
        }
    
        try {
            List<Event> events = evntMgr.findEventsInRange(startDate, endDate, users);
    
            List<EventDTO> eventDTOs = events.stream()
                    .map(event -> new EventDTO(
                            event.getId(),
                            event.getName(),
                            event.getDescription(),
                            event.getStart(),
                            event.getEnd(),
                            event.getColor(),
                            new UserDTO(event.getCreator().getUsername(), event.getCreator().getName(), event.getCreator().getEmail(), event.getCreator().getUserCreated(), event.getCreator().isAdmin(), event.getCreator().getUserRole(), event.getCreator().getId(), event.getCreator().getManagedUsers()),
                            event.getAttendees().stream().map(attendee -> new UserDTO(attendee.getUsername(), attendee.getName(), attendee.getEmail(), attendee.getUserCreated(), attendee.isAdmin(), attendee.getUserRole(), attendee.getId(), attendee.getManagedUsers())).collect(Collectors.toList())
                    ))
                    .collect(Collectors.toList());
    
            return Response.ok(eventDTOs).build();
        } catch (IllegalArgumentException e) {
            // Invalid date format
            ErrorDTO errorDTO = new ErrorDTO(e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorDTO)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
    }
    

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin", "employee"})
    public Response addEvent(CreateEventRequest createEventRequest) {
        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername = token.getClaim("sub");
        PISUser loggedInUser = userMgr.findByUsername(loggedInUsername);
    
        List<PISUser> attendees = new ArrayList<>();
        for (String attendeeUsername : createEventRequest.getAttendees()) {
            PISUser attendee = userMgr.findByUsername(attendeeUsername);
            if (attendee == null) {
                // Return 400 Bad Request if the username does not exist
                return Response.status(Status.BAD_REQUEST)
                        .entity(new ErrorDTO("Username not found: " + attendeeUsername))
                        .type(MediaType.APPLICATION_JSON)
                        .build();
            }
            attendees.add(attendee);
        }
    
        Event event = new Event();
        event.setCreator(loggedInUser);
        event.setStart(createEventRequest.getStart());
        event.setEnd(createEventRequest.getEnd());
        event.setName(createEventRequest.getName());
        event.setDescription(createEventRequest.getDescription());
        event.setColor(createEventRequest.getColor());
        event.setAttendees(attendees);
    
        Event savedEvent = evntMgr.save(event);
    
        // Create notifications for each attendee
        for (PISUser attendee : attendees) {
            Notification notification = new Notification();
            notification.setEvent(savedEvent);
            notification.setAttendee(attendee);
            notification.setAck(false);
            ntfMgr.save(notification); 
        }
    
        final URI uri = UriBuilder.fromPath("/events/{resourceServerId}").build(savedEvent.getId());
        return Response.created(uri).build();
    }

    @PATCH
    @Path("/{eventId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateEvent(@PathParam("eventId") long eventId, CreateEventRequest createEventRequest) {
        Event event = evntMgr.findById(eventId);
        if (event == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Event not found for ID: " + eventId).type(MediaType.APPLICATION_JSON).build();
        }
        
        // Update the event properties based on the request
        if (createEventRequest.getStart() != null) {
            event.setStart(createEventRequest.getStart());
        }
        if (createEventRequest.getEnd() != null) {
            event.setEnd(createEventRequest.getEnd());
        }
        if (createEventRequest.getName() != null) {
            event.setName(createEventRequest.getName());
        }
        if (createEventRequest.getDescription() != null) {
            event.setDescription(createEventRequest.getDescription());
        }
        if (createEventRequest.getColor() != null) {
            event.setColor(createEventRequest.getColor());
        }
        if (createEventRequest.getAttendees() != null) {
            List<PISUser> attendees = createEventRequest.getAttendees().stream()
                    .map(userMgr::findByUsername)
                    .collect(Collectors.toList());
            event.setAttendees(attendees);
        }
        
        // Save the updated event
        Event updatedEvent = evntMgr.save(event);
        
        return Response.ok().entity(updatedEvent).build();
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

        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername = token.getClaim("sub");
        PISUser loggedInUser = userMgr.findByUsername(loggedInUsername);
        
        if (event == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Event not found for ID: " + id).type(MediaType.APPLICATION_JSON).build();
        }
        if (event.getCreator().getId() != loggedInUser.getId()) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Logged user is not event creator ID: " + id).type(MediaType.APPLICATION_JSON).build();
        }
        evntMgr.removeById(id);
        return Response.noContent().build();
    }


}
