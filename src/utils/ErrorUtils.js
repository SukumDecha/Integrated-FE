export function getErrorMessage (err) {
    return err instanceof Error ? {
      message: err.message,
      stack: err.stack
    } : "Internal Server: Please check service"
  }