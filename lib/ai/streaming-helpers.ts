import { NextResponse } from 'next/server';
// No need to import ReadableStream as it's globally available

export interface StreamingText {
  text: string;
}

/**
 * Utility function to create a streaming response for progress updates during analysis
 */
export function createAnalysisStream(
  handler: (updateProgress: (message: string) => void) => Promise<Record<string, any> | { error: string }>
) {
  // Create a TransformStream instead of directly using ReadableStream
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  
  // Function to send a formatted SSE message with a small delay
  const sendMessage = async (type: string, data: any) => {
    try {
      // For larger objects like the final result, we might need to handle them differently
      let formattedData;
      
      if (type === 'complete') {
        console.log(`Preparing complete message`);
        
        // Format the message differently for the 'complete' type
        // This restructures the data to ensure it's properly formatted for the client
        const messageObj = { 
          type: 'complete',
          result: data 
        };
        
        formattedData = JSON.stringify(messageObj);
        console.log(`Complete message formatted, sending result with keys: ${Object.keys(data)}`);
      } else {
        // For other message types, use the standard format
        formattedData = JSON.stringify({ type, ...data });
      }
      
      // Send the message with proper SSE format (data: {...}\n\n)
      const message = `data: ${formattedData}\n\n`;
      await writer.write(encoder.encode(message));
      
      // Log the message being sent (truncate long messages)
      if (formattedData.length > 200) {
        console.log(`Sent ${type} message: ${formattedData.substring(0, 100)}...`);
      } else {
        console.log(`Sent ${type} message: ${formattedData}`);
      }
      
      // Larger delay for complete messages to ensure proper transmission
      if (type === 'complete') {
        await new Promise(resolve => setTimeout(resolve, 150));
      } else {
        // Small delay for progress messages to ensure proper message processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Process the handler in the background
  (async () => {
    try {
      // Function to update progress that will be passed to the handler
      const updateProgress = async (message: string) => {
        // Send the message to the client
        await sendMessage('progress', { message });
      };
      
      // Immediately send a connection established message
      await sendMessage('progress', { message: 'Connection established' });
      
      // Call the handler with the updateProgress function
      console.log('Starting analysis handler...');
      const result = await handler(updateProgress);
      console.log('Handler completed. Preparing to send final result...');
      
      // Send the final result
      await sendMessage('complete', result);
      console.log('Final result sent to client');
    } catch (error) {
      // Send any errors
      console.error('Error in streaming process:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await sendMessage('error', { error: errorMessage });
    } finally {
      try {
        // Only close if the writer is still writable
        if (!writer.closed) {
          console.log('Closing stream writer');
          await writer.close();
        }
      } catch (error) {
        console.error('Error closing writer:', error);
      }
    }
  })();
  
  // Return a streaming response with the correct headers for SSE
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Important for NGINX
    },
  });
} 