import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  private formatTime(time: string | null | undefined): string | null {
    if (!time) return null;
    // Ensure time is in HH:MM format
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const formattedDto = {
      ...createScheduleDto,
      morningOpenTime: this.formatTime(createScheduleDto.morningOpenTime),
      morningCloseTime: this.formatTime(createScheduleDto.morningCloseTime),
      eveningOpenTime: this.formatTime(createScheduleDto.eveningOpenTime),
      eveningCloseTime: this.formatTime(createScheduleDto.eveningCloseTime),
    };

    const existing = await this.scheduleRepository.findOneBy({
      branch: formattedDto.branch
    });

    if (existing) {
      Object.assign(existing, formattedDto);
      return this.scheduleRepository.save(existing);
    }

    const schedule = this.scheduleRepository.create(formattedDto);
    return this.scheduleRepository.save(schedule);
  }

  findAll() {
    return this.scheduleRepository.find();
  }

  findByBranch(branch: string) {
    return this.scheduleRepository.findOneBy({ branch });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) throw new NotFoundException(`Schedule with ID ${id} not found`);

    const formattedDto = {
      ...updateScheduleDto,
      morningOpenTime: this.formatTime(updateScheduleDto.morningOpenTime),
      morningCloseTime: this.formatTime(updateScheduleDto.morningCloseTime),
      eveningOpenTime: this.formatTime(updateScheduleDto.eveningOpenTime),
      eveningCloseTime: this.formatTime(updateScheduleDto.eveningCloseTime),
    };

    // Validate shift times if they are being updated
    if (updateScheduleDto.morningOpenTime !== undefined || updateScheduleDto.morningCloseTime !== undefined) {
      const morningOpenTime = updateScheduleDto.morningOpenTime ?? schedule.morningOpenTime;
      const morningCloseTime = updateScheduleDto.morningCloseTime ?? schedule.morningCloseTime;
      if (this.isInvalidShiftTime(morningOpenTime, morningCloseTime)) {
        throw new BadRequestException('Both morning open and close times must be provided if one is set');
      }
    }

    if (updateScheduleDto.eveningOpenTime !== undefined || updateScheduleDto.eveningCloseTime !== undefined) {
      const eveningOpenTime = updateScheduleDto.eveningOpenTime ?? schedule.eveningOpenTime;
      const eveningCloseTime = updateScheduleDto.eveningCloseTime ?? schedule.eveningCloseTime;
      if (this.isInvalidShiftTime(eveningOpenTime, eveningCloseTime)) {
        throw new BadRequestException('Both evening open and close times must be provided if one is set.');
      }
    }

    // Create updated schedule object
    const updatedSchedule = {
      ...schedule,
      ...updateScheduleDto
    };

    // Validate that at least one shift remains valid
    if (!this.hasValidShift(updatedSchedule)) {
      throw new BadRequestException('At least one shift (morning or evening) must be provided');
    }

    Object.assign(schedule, formattedDto);
    return this.scheduleRepository.save(schedule);
  }

  async isCurrentlyOpen(branch: string) {
    const schedule = await this.scheduleRepository.findOneBy({
      branch,
      isOpen: true
    });

    if (!schedule) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const isMorningShift = Boolean(
      schedule.morningOpenTime &&
      schedule.morningCloseTime &&
      currentTime >= schedule.morningOpenTime &&
      currentTime <= schedule.morningCloseTime
    );

    const isEveningShift = Boolean(
      schedule.eveningOpenTime &&
      schedule.eveningCloseTime &&
      currentTime >= schedule.eveningOpenTime &&
      currentTime <= schedule.eveningCloseTime
    );

    return isMorningShift || isEveningShift;
  }

  private isInvalidShiftTime(openTime?: string | null, closeTime?: string | null): boolean {
    return Boolean((openTime && !closeTime) || (!openTime && closeTime));
  }

  private hasValidShift(schedule: Partial<Schedule>): boolean {
    const hasMorningShift = Boolean(schedule.morningOpenTime && schedule.morningCloseTime);
    const hasEveningShift = Boolean(schedule.eveningOpenTime && schedule.eveningCloseTime);
    return Boolean(hasMorningShift || hasEveningShift);
  }
}