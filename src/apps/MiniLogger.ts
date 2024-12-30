export type LogLevel = 'error' | 'warn' | 'log' | 'info' | 'debug'
export type LogEntry = { level: LogLevel; message: string }

export class Summary {
   out: LogEntry[] = []
   error(x: string): void {
      this.out.push({ message: x, level: 'error' })
   }
   log(x: string): void {
      this.out.push({ message: x, level: 'log' })
   }
   warn(x: string): void {
      this.out.push({ message: x, level: 'warn' })
   }
   info(x: string): void {
      this.out.push({ message: x, level: 'info' })
   }
   debug(x: string): void {
      this.out.push({ message: x, level: 'debug' })
   }

   print(): void {
      for (const entry of this.out) {
         if (entry.level == 'error') console.error(entry.message)
         else if (entry.level == 'warn') console.warn(entry.message)
         else if (entry.level == 'log') console.log(entry.message)
         else if (entry.level == 'info') console.debug(entry.message)
         else if (entry.level == 'debug') console.debug(entry.message)
         else throw new Error('unreachable')
      }
   }

   get text(): string {
      return this.out.map((x) => x.message).join('\n')
   }
}
