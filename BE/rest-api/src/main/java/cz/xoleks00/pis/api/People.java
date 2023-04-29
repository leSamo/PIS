package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
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
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.Car;
import cz.xoleks00.pis.data.ErrorDTO;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.PersonEventsDTO;
import cz.xoleks00.pis.data.Person;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.PersonManager;


/*
 * TEST URL:
 * http://localhost:8080/jsf-basic/rest/people/list
 */
@Path("/people")
public class People 
{
	@Inject
	private PersonManager personMgr; 

    @Inject
    private EventManager eventMgr;


    @Context
    private UriInfo context;

    @Context
    private SecurityContext securityContext;


    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{4,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^[a-zA-Z0-9!@#$%^&*()_+,-./:;<=>?@[\\\\]^_`{|}~]{8,128}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    /**
     * Default constructor. 
     */
    public People() 
    {
    }

    @PostConstruct
    public void init()
    {
    }
    
    @GET
    @RolesAllowed({ "admin", "employee" })
    @Produces(MediaType.APPLICATION_JSON)
    public List<Person> getPeople() 
    {
    	return personMgr.findAll();
    }

    @Path("/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getPersonSingle(@PathParam("id") Long id) 
    {
    	Person p = personMgr.find(id);
    	if (p != null)
    		return Response.ok(p).build();
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updatePeople(List<Person> content) 
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
    @RolesAllowed({ "admin", "employee" })
    public Response updatePersonSingle(@PathParam("id") Long id, Person src) 
    {
    	Person p = personMgr.find(id);
    	if (p != null)
    	{
    		p.setName(src.getName());
    		p.setUserCreated(src.getUserCreated());
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
    @RolesAllowed("admin")
    public Response addPerson(Person person) {
        if (!USERNAME_PATTERN.matcher(person.getUsername()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid username")).build();
        }
    
        if (!PASSWORD_PATTERN.matcher(person.getPassword()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid password")).build();
        }
    
        if (!EMAIL_PATTERN.matcher(person.getEmail()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid email")).build();
        }
    
        Person existingByUsername = personMgr.findByUsername(person.getUsername());
        if (existingByUsername != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Username is taken")).build();
        }
    
        Person existingByEmail = personMgr.findByEmail(person.getEmail());
        if (existingByEmail != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Email is taken")).build();
        }
    
        person.setUserCreated(new Date()); // Set the current date as userCreated
        person.setAdmin(false); // Set isAdmin to false by default
        Person savedPerson = personMgr.save(person);
        final URI uri = UriBuilder.fromPath("/people/{resourceServerId}").build(savedPerson.getId());
        return Response.created(uri).build(); 
    }
    
    
    /**
     * Deletes a person.
     * @param id
     * @return
     */
    @Path("/{id}")
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response deletePerson(@PathParam("id") Long id) {
        Person p = personMgr.find(id);
    
        // Get the logged-in user's ID
        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername =token.getClaim("sub");
        Person o = personMgr.findByUsername(loggedInUsername);

    
        if (id.equals(o.getId())) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("User cannot delete themselves")).build();
        }
        System.out.println(id.equals(o.getId()));
    
        if (p != null) {
            personMgr.remove(p);
            return Response.ok().build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
        }
    }
    
    @Path("/{id}/cars")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getCarsForPerson(@PathParam("id") Long id) 
    {
    	Person p = personMgr.find(id);
    	if (p != null)
    		return Response.ok(p.getCars()).build();
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }
   
    @Path("/{id}/cars")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response addCarToPerson(@PathParam("id") Long personId, Car car) 
    {
    	Person p = personMgr.find(personId);
    	if (p != null)
    	{
    		personMgr.addCar(p, car);
    		return Response.ok(p.getCars()).build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }

    @Path("/{id}/events")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getEventsForPerson(@PathParam("id") Long id) {
        Person p = personMgr.find(id);
    
        if (p != null) {
            // Get the events where the user is a creator or an attendee
            List<Event> userEvents = eventMgr.findEventsByUserId(id);
            PersonEventsDTO personEventsDTO = new PersonEventsDTO(userEvents);
            return Response.ok(personEventsDTO).build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
        }
    }
   

}