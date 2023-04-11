package cz.xoleks00.pis.rest;

import jakarta.ejb.Stateless;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;



/*
 * TEST URL:
 * http://localhost:8080/pis-calendar/rest/ping
 */
@Stateless
@Path("/ping")
public class PingEndpoint 
{

    /**
     * Default constructor. 
     */
    public PingEndpoint() 
    {
    }

    @Path("/")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String ping() 
    {
        return "ok";
    }

    @Path("/json")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public DataBean getJson() 
    {
        return new DataBean("ok", "Everything works!");
    }

    @Path("/json/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getJson(@PathParam("id") int id) 
    {
        if (id <= 10) {
            return Response.ok(new DataBean("ok", "Code " + id + " is ok!")).build();
        } else {
            return Response.status(Status.NOT_FOUND)
                    .entity(new DataBean("error", "Code " + id + " not found!"))
                    .build();
        }
    }


}