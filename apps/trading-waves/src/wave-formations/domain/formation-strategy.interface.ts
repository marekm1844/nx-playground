import { WaveCompletedEventDTO } from '../dto/wave-completed-event.dto';

export interface IFormationStrategy {
  isFormationDetected(waves: WaveCompletedEventDTO): Promise<boolean>;
  getFormationName(): string;
}
