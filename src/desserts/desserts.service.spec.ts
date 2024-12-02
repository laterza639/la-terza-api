import { Test, TestingModule } from '@nestjs/testing';
import { DessertsService } from './desserts.service';

describe('DessertsService', () => {
  let service: DessertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DessertsService],
    }).compile();

    service = module.get<DessertsService>(DessertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
