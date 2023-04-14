/**
 * 
 */
package cz.xoleks00.pis.api;

import java.util.List;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.UriInfo;

import cz.xoleks00.pis.data.Car;
import cz.xoleks00.pis.service.CarManager;

@Path("/cars")
public class Cars 
{
	@Inject
	private CarManager carMgr;
    @Context
    private UriInfo context;

    /**
     * Default constructor. 
     */
    public Cars() 
    {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Car> getCars() 
    {
    	return carMgr.findAll();
    }

}
