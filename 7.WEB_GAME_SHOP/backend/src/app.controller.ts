import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import helper from './modules/helper';

// interface는 들어오는 객체 프로퍼티의 타입을 지정하고 검사가 가능하게 한다
// interface Message {
//   message: string;
// }

@Controller() // base url
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/add-line-item')
  addLineItem(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addLineItem(body, token);
  }

  @Post('add-dib')
  addDib(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addDib(token, body);
  }

  @Post('/order')
  addOrder(@Body() body, @Req() req: Request): object {
    if (req.headers.authorization) {
      const token = helper.helpGetToken(req);

      return this.appService.addOrder(token, body);
    }
    return this.appService.addOrder(null, body);
  }

  @Post('/order-now')
  addOrderNow(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addOrderNow(token, body);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/get-tag')
  getTag(): object {
    return this.appService.getTag();
  }

  @Get('/basket')
  getLineItem(): object {
    return this.appService.getLineItem();
  }

  @Post('/signup')
  signUp(@Body() body): object {
    return this.appService.signUp(body);
  }

  @Post('/signin')
  signIn(@Body() body): object {
    return this.appService.signIn(body);
  }

  @Post('/get-item-info')
  getItemInfo(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getItemInfo(token, body);
  }

  @Post('/out-basket')
  deleteLineItem(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.deleteLineItem(token, body);
  }

  @Post('/add-review')
  addReview(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addReview(token, body);
  }

  @Post('/create-item')
  createItem(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.createItem(token, body);
  }

  // change test

  @Post('/search')
  addSearch(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addSearch(token, body);
  }

  @Post('/add-filter-tag')
  addFilterTag(@Body() body, @Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.addFilterTag(token, body);
  }

  @Post('/add-bell')
  addBell(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.addBell(token, body);
  }

  @Post('/add-option')
  addOption(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.addOption(token, body);
  }

  @Post('/add-tag')
  addTag(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.addTag(token, body);
  }

  @Post('/pay')
  getRp(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.getRp(token, body);
  }

  // @Post('/upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  // }

  @Get('/get-bell')
  getBell(@Req() req: Request): object {
    const token = helper.helpGetToken(req);
    return this.appService.getBell(token);
  }

  @Get('/contacts')
  getContacts(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    console.log(this.appService.getContacts(token));
    return this.appService.getContacts(token);
  }

  @Get('/list-orders')
  getListOrders(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getListOrders(token);
  }

  @Get('/get-item-list')
  getItemList(): object {
    return this.appService.getItemList();
  }

  @Get('/dibs')
  getDibList(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getDibList(token);
  }

  @Get('/user-info')
  getUserInfo(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getUserInfo(token);
  }

  @Get('/statistics')
  getStatistics(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getStatistics(token);
  }

  @Get('/get-keyword-rate')
  getKeywordRate(): object {
    return this.appService.getKeywordRate();
  }

  @Get('/get-all-tag')
  getAllTag(): object {
    return this.appService.getAllTag();
  }

  @Get('/get-filter-tag')
  getFilterTag(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.getFilterTag(token);
  }

  @Get('/clear-bell-bedge')
  clearBellBedge(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.clearBellBedge(token);
  }

  @Post('/success')
  async success(
    @Req() req: Request,
    @Res() res,
    @Body() body,
  ): Promise<string> {
    const token = helper.helpGetToken(req);
    return this.appService.success(token, body);
    // if (result === '성공') {
    //   return res.redirect('http://localhost:8080/');
    // } else {
    //   return res.redirect('http://localhost:8080/fail');
    // }
  }

  @Get('/get-line-item')
  getLineItemForBasket(@Req() req: Request): object {
    const token = helper.helpGetToken(req);
    return this.appService.getLineItemForBasket(token);
  }

  @Post('/config-name')
  configName(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.configName(token, body);
  }

  @Post('/config-pw')
  configPw(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.configPw(token, body);
  }

  @Post('/delete-user')
  deleteUser(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.deleteUser(token, body);
  }

  @Post('/delete-item')
  deleteItem(@Req() req: Request, @Body() body): object {
    const token = helper.helpGetToken(req);

    return this.appService.deleteItem(token, body);
  }

  @Delete('/delete-bells')
  deleteBells(@Req() req: Request): object {
    const token = helper.helpGetToken(req);

    return this.appService.deleteBells(token);
  }
}
