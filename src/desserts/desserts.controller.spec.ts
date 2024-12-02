import { Test, TestingModule } from '@nestjs/testing';
import { DessertsController } from './desserts.controller';
import { DessertsService } from './desserts.service';

describe('DessertsController', () => {
  let controller: DessertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DessertsController],
      providers: [DessertsService],
    }).compile();

    controller = module.get<DessertsController>(DessertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
