import { SetMetadata } from '@nestjs/common';

// This decorator is used to mark a route as public
export const Public = () => SetMetadata('isPublic', true);
