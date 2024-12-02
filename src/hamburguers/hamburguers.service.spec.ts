import { Test, TestingModule } from '@nestjs/testing';
import { HamburguersService } from './hamburguers.service';

describe('HamburguersService', () => {
  let service: HamburguersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HamburguersService],
    }).compile();

    service = module.get<HamburguersService>(HamburguersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
