/**
 * =========================================================================================
 * Centralized Logging Subsystem: Sanitized Function & GenAI Telemetry
 * =========================================================================================
 * 
 * WHAT THIS FEATURE IS ABOUT:
 * This utility provides transparent, structured info logging for application function calls
 * and Google GenAI invocations across both client and server runtimes. To maintain performance,
 * prevent memory bloat, and protect sensitive payloads, the logger automatically strips heavy
 * inline data (such as base64 images, audio blobs, and binary attachments) before emitting logs
 * via `console.info`.
 * 
 * DIFFERENT USE CASES:
 * 1. Function Call Auditing: Logging every function invocation, along with arguments passed,
 *    allowing investigators and developers to reconstruct the step-by-step state machine transitions
 *    (e.g. suspect selection, statement cracking, modal toggling, indictment submissions).
 * 2. Generative AI Telemetry: Explicitly logging all parameters sent to the Gemini API (model ID,
 *    system instructions, conversation history, user prompts, temperature, formatting config)
 *    and the subsequent structured outputs emitted by the model.
 * 3. Inline Data Sanitization: Stripping raw base64 data strings and image byte streams while
 *    preserving metadata (such as mimeType, byte lengths, and structural context).
 * 4. Dual-Environment Compatibility: Functions cleanly in both Vite React browser environments
 *    and Node.js Express server environments without external dependencies.
 * =========================================================================================
 */

/**
 * Recursively traverses any data structure to sanitize and strip large inline data
 * (such as base64 byte streams, image buffers, or inlineData objects) from the log output.
 * 
 * @param target - The item or object graph to sanitize
 * @param depth - Current recursion depth to prevent cyclic references
 * @returns A safe, clone-like representation with inline data stripped
 */
export function stripInlineData(target: any, depth = 0): any {
  if (depth > 6) return '[MAX_DEPTH_REACHED]';
  if (target === null || target === undefined) return target;

  if (typeof target === 'string') {
    // Detect base64 data URLs or long base64 strings
    if (target.startsWith('data:') && target.includes(';base64,')) {
      const mime = target.substring(5, target.indexOf(';'));
      return `[INLINE_DATA: ${mime} (${target.length} chars stripped)]`;
    }
    if (target.length > 500 && /^[A-Za-z0-9+/=]+$/.test(target.slice(0, 100))) {
      return `[BASE64_DATA: ${target.length} bytes stripped]`;
    }
    return target;
  }

  if (typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => stripInlineData(item, depth + 1));
  }

  // Handle specialized inlineData objects in Google GenAI SDK
  if ('inlineData' in target && target.inlineData) {
    const { mimeType, data } = target.inlineData;
    return {
      inlineData: {
        mimeType: mimeType || 'unknown',
        data: `[STRIPPED_INLINE_DATA: ${typeof data === 'string' ? data.length : 'buffer'} bytes]`,
      },
    };
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(target)) {
    if (key.toLowerCase().includes('inlinedata') || key === 'base64' || key === 'buffer') {
      cleanObj[key] = '[STRIPPED_DATA]';
    } else {
      cleanObj[key] = stripInlineData(value, depth + 1);
    }
  }
  return cleanObj;
}

/**
 * Logs a standard application function call as INFO with sanitized input parameters.
 * 
 * @param functionName - The identifier or signature of the function being invoked
 * @param parameters - Key-value map of function arguments or primary payload
 */
export function logFunctionCall(functionName: string, parameters?: Record<string, any> | any): void {
  const sanitizedParams = parameters !== undefined ? stripInlineData(parameters) : undefined;
  if (sanitizedParams !== undefined) {
    console.info(`[FUNC] ${functionName}`, sanitizedParams);
  } else {
    console.info(`[FUNC] ${functionName}`);
  }
}

/**
 * Detailed telemetry interface for Google GenAI calls
 */
export interface GenAICallDetails {
  model: string;
  promptOrContents: any;
  config?: any;
  output?: any;
}

/**
 * Logs a Google GenAI API invocation as INFO with sanitized prompt, model parameters,
 * generation configuration, and model outputs. All inline data is stripped.
 * 
 * @param details - Parameters sent to and received from the Gemini model
 */
export function logGenAICall(details: GenAICallDetails): void {
  const sanitized = {
    model: details.model,
    promptOrContents: stripInlineData(details.promptOrContents),
    config: stripInlineData(details.config),
    output: details.output !== undefined ? stripInlineData(details.output) : undefined,
  };
  console.info(`[GENAI] Model: ${sanitized.model}`, sanitized);
}

/**
 * General structured info logger with contextual prefix.
 * 
 * @param context - The architectural domain or subsystem (e.g. 'AUDIO', 'BIOMETRICS', 'STORAGE')
 * @param message - Descriptive event log message
 * @param metadata - Optional accompanying context payload
 */
export function logInfo(context: string, message: string, metadata?: any): void {
  if (metadata !== undefined) {
    console.info(`[${context}] ${message}`, stripInlineData(metadata));
  } else {
    console.info(`[${context}] ${message}`);
  }
}
