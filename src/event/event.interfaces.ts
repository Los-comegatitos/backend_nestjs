export interface FilteredService {
  serviceTypeId: string;
  name: string;
  description: string;
  quantity: number | null;
  dueDate: Date;
}
// filtered event es lo que va a retornar el listar eventos para proveedores, ya que los proveedores no necesitan más información que esta.
export interface FilteredEvent {
  name: string;
  description: string;
  eventDate: Date;
  services: FilteredService[];
}
