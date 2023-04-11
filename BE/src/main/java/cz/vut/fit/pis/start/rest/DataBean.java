/**
 * 
 */
package cz.vut.fit.pis.start.rest;

/**
 * A simple data bean for JSON responses.
 * 
 * @author burgetr
 */
public class DataBean
{
    public String status;
    public String message;
    
    public DataBean(String status, String message)
    {
        super();
        this.status = status;
        this.message = message;
    }

    public String getStatus()
    {
        return status;
    }

    public String getMessage()
    {
        return message;
    }

}
