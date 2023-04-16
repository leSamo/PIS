package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.List;

import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.ErrorDTO;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.service.EventManager;

/*
 * TEST URL:
 * http://localhost:8080/jsf-basic/rest/events
 */
@Path("/events")
public class Events 
{
	@Inject
	private EventManager evntMgr; 
    @Context
    private UriInfo context;

    /**
     * Default constructor. 
     */
    public Events() 
    {
    }

    @PostConstruct
    public void init()
    {
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Event> getEvents() 
    {
    	return evntMgr.findAll();
    }

    @Path("/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getEventSingle(@PathParam("id") Long id) 
    {
    	Event p = evntMgr.find(id);
    	if (p != null)
    		return Response.ok(p).build();
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePeople(List<Event> content) 
    {
    	return Response.status(Response.Status.NOT_IMPLEMENTED).entity(new ErrorDTO("Not implemented")).build();
    }
    
    /**
     * Updates a person.
     * @param id
     * @param src
     * @return
     */
    @Path("/{id}")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateEventSingle(@PathParam("id") Long id, Event src) 
    {
    	Event p = evntMgr.find(id);
    	if (p != null)
    	{
    		p.setName(src.getName());
    		p.setSurname(src.getSurname());
    		p.setBorn(src.getBorn());
    		return Response.ok(p).build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }
    
    /**
     * Adds a new person.
     * @param person The person to add.
     * @return
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addEvent(Event event)
    {
    	Event existing = evntMgr.find(event.getId());
    	if (existing == null)
    	{
	    	Event savedEvent = evntMgr.save(event);
	    	final URI uri = UriBuilder.fromPath("/events/{resourceServerId}").build(savedEvent.getId());
	    	return Response.created(uri).entity(savedEvent).build();
    	}
    	else
    	{
    		return Response.status(Status.CONFLICT).entity(new ErrorDTO("duplicate id")).build();
    	}
    }
    
    /**
     * Deletes a person.
     * @param id
     * @return
     */
    @Path("/{id}")
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteEvent(@PathParam("id") Long id) 
    {
    	Event p = evntMgr.find(id);
    	if (p != null)
    	{
    		evntMgr.remove(p);
    		return Response.ok().build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }
   

}