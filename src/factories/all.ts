'use strict';

import rosie = require('rosie');
const Factory = rosie.Factory;

import definePostModel from './Post';
import defineUserModel from './User';

definePostModel(Factory);
defineUserModel(Factory);

export default Factory;
