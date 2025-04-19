
export const emitGenerationEvent = (eventName: string, data: any = {}) => {
  const event = new CustomEvent(eventName, { 
    detail: data,
    bubbles: true 
  });
  window.dispatchEvent(event);
};
