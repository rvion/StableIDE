export class Stack<T = string> {
   items: T[] = []

   push(item: T): void {
      const prevIndex = this.items.indexOf(item)
      if (prevIndex > -1) {
         this.items.splice(prevIndex, 1)
      }
      this.items.push(item)
   }

   last(): Maybe<T> {
      return this.items[this.items.length - 1]
   }

   remove(item: T): void {
      const index = this.items.indexOf(item)
      if (index > -1) {
         this.items.splice(index, 1)
      }
   }
}
