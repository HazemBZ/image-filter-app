import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import url from 'url'

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());



  app.get('/filteredimage', async (req: Request, res: Response) => {
    let image_url: string =  ''
    // if(req.query.image_url)
    const image_query: string|string[] = url.parse(req.url, true).query.image_url
    if(typeof image_query === 'string')
      image_url = image_query
    else 
      image_url = image_query[0]
    if(!image_url)
      return res.status(400).send({message: 'image_url is required'})
    await filterImageFromURL(image_url)
    .then(saved_image => {
      res.status(200).sendFile(saved_image, async () => await deleteLocalFiles([saved_image]))
    })
    .catch(err => {
      return res.status(400).send({message: `Failed to process image: ${image_url}`, error: err})
    })
  
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();