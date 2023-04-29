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
import jakarta.ws.rs.QueryParam;
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
import cz.xoleks00.pis.data.UserEventsDTO;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.UserManager;


/*
 * TEST URL:
 * http://localhost:8080/jsf-basic/rest/users/list
 */
@Path("/users")
public class Users
{
	@Inject
	private UserManager userMgr; 

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
    public Users() 
    {
    }

    @PostConstruct
    public void init()
    {
    }
    

    @GET
    @RolesAllowed({ "admin", "employee" })
    @Produces(MediaType.APPLICATION_JSON)
    public List<PISUser> getUsers(@QueryParam("filter") String filter) {
        if (filter == null || filter.isEmpty()) {
            return userMgr.findAll();
        } else {
            return userMgr.findBySubstring(filter);
        }
    }
    @Path("/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getUserSingle(@PathParam("id") Long id) 
    {
    	PISUser p = userMgr.find(id);
    	if (p != null)
    		return Response.ok(p).build();
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateUsers(List<PISUser> content) 
    {
    	return Response.status(Response.Status.NOT_IMPLEMENTED).entity(new ErrorDTO("Not implemented")).build();
    }
    
    /**
     * Updates a PISUser.
     * @param id
     * @param src
     * @return
     */
    @Path("/{id}")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateUserSingle(@PathParam("id") Long id, PISUser src) 
    {
    	PISUser p = userMgr.find(id);
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
     * Adds a new PISUser.
     * @param PISUser The PISUser to add.
     * @return
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response addUser(PISUser PISUser) {
        if (!USERNAME_PATTERN.matcher(PISUser.getUsername()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid username")).build();
        }
    
        if (!PASSWORD_PATTERN.matcher(PISUser.getPassword()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid password")).build();
        }
    
        if (!EMAIL_PATTERN.matcher(PISUser.getEmail()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid email")).build();
        }
    
        PISUser existingByUsername = userMgr.findByUsername(PISUser.getUsername());
        if (existingByUsername != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Username is taken")).build();
        }
    
        PISUser existingByEmail = userMgr.findByEmail(PISUser.getEmail());
        if (existingByEmail != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Email is taken")).build();
        }
    
        PISUser.setUserCreated(new Date()); // Set the current date as userCreated
        PISUser.setAdmin(false); // Set isAdmin to false by default
        PISUser savedUser = userMgr.save(PISUser);
        final URI uri = UriBuilder.fromPath("/users/{resourceServerId}").build(savedUser.getId());
        return Response.created(uri).build(); 
    }
    
    
    /**
     * Deletes a PISUser.
     * @param id
     * @return
     */
    @Path("/{id}")
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response deleteUser(@PathParam("id") Long id) {
        PISUser p = userMgr.find(id);
    
        // Get the logged-in user's ID
        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername =token.getClaim("sub");
        PISUser o = userMgr.findByUsername(loggedInUsername);

    
        if (id.equals(o.getId())) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("User cannot delete themselves")).build();
        }
    
        if (p != null) {
            userMgr.remove(p);
            return Response.ok().build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
        }
    }
    
    @Path("/{id}/cars")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getCarsForUser(@PathParam("id") Long id) 
    {
    	PISUser p = userMgr.find(id);
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
    public Response addCarToUser(@PathParam("id") Long userId, Car car) 
    {
    	PISUser p = userMgr.find(userId);
    	if (p != null)
    	{
    		userMgr.addCar(p, car);
    		return Response.ok(p.getCars()).build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
    }

    @Path("/{id}/events")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getEventsForUser(@PathParam("id") Long id) {
        PISUser p = userMgr.find(id);
    
        if (p != null) {
            // Get the events where the user is a creator or an attendee
            List<Event> userEvents = eventMgr.findEventsByUserId(id);
            UserEventsDTO userEventsDTO = new UserEventsDTO(userEvents);
            return Response.ok(userEventsDTO).build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).build();
        }
    }
   

}