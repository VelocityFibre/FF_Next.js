// BOQ CRUD module exports
export { BOQReadOperations } from './read-operations';
export { BOQWriteOperations } from './write-operations';

// Backward compatibility - Re-export as BOQCrud class
export class BOQCrud {
  // Read operations
  static getAll = BOQReadOperations.getAll;
  static getById = BOQReadOperations.getById;
  static getByProject = BOQReadOperations.getByProject;
  static getByStatus = BOQReadOperations.getByStatus;
  static exists = BOQReadOperations.exists;
  static search = BOQReadOperations.search;
  
  // Write operations
  static create = BOQWriteOperations.create;
  static update = BOQWriteOperations.update;
  static delete = BOQWriteOperations.delete;
  static updateStatus = BOQWriteOperations.updateStatus;
  static batchUpdate = BOQWriteOperations.batchUpdate;
}