import { Test, TestingModule } from '@nestjs/testing';
import { HamburguersController } from './hamburguers.controller';
import { HamburguersService } from './hamburguers.service';

describe('HamburguersController', () => {
  let controller: HamburguersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HamburguersController],
      providers: [HamburguersService],
    }).compile();

    controller = module.get<HamburguersController>(HamburguersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
