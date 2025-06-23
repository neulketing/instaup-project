// 간단한 로거 구현 (winston 없이)
class Logger {
  info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '')
  }

  error(message: string, meta?: any) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, meta || '')
  }

  warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '')
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '')
    }
  }
}

export const logger = new Logger()
export default logger
