/**
 * ErrorDTO.java
 *
 * Created on 3. 3. 2022, 13:12:52 by burgetr
 */
package cz.xoleks00.pis.data;

/**
 * 
 * @author burgetr
 */
public class ErrorDTO
{
    private String status;
    
    private String message;

    public ErrorDTO()
    {
    }
    
    public ErrorDTO(String message)
    {
        this.status = "error";
        this.message = message;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getMessage()
    {
        return message;
    }

    public void setMessage(String message)
    {
        this.message = message;
    }

}
