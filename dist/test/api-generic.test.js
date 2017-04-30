'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const chai = require("chai");
const chaiHttp = require('chai-http');
const Factory = require('./../factories/all');
const inflection = require('inflection');
const server = require('../server');
const sinon = require('sinon');
const StringUtils = require('./../utils/String');
chai.should();
chai.use(chaiHttp);
const models = server.models;
Object.keys(models).forEach(modelName => {
    let model = models[modelName];
    let modelType = inflection.pluralize(StringUtils.convertCamelToDasherized(model.name));
    describe(`API - generic test for model ${modelType}`, () => {
        let fakeClock = null;
        beforeEach((done) => {
            fakeClock = sinon.useFakeTimers();
            Promise.all([
                server.db.query('TRUNCATE users'),
                server.db.query('TRUNCATE posts')
            ]).then(() => done());
        });
        afterEach(() => {
            fakeClock.restore();
        });
        describe(`GET /api/${modelType}`, () => {
            it(`should return empty array when no ${modelType} exist`, (done) => {
                chai.request(server.app)
                    .get(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.eql([]);
                    done();
                });
            });
            it(`should return an array of ${modelType}`, (done) => {
                let modelDefinitions = Factory.buildList(modelName, 2);
                modelDefinitions.forEach((def, index) => {
                    def.id = index + 1;
                    model.create(def);
                });
                chai.request(server.app)
                    .get(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.length.should.be.eql(2);
                    res.body.data[0].type.should.be.eql(modelType);
                    res.body.data[1].type.should.be.eql(modelType);
                    done();
                });
            });
        });
        describe(`GET /api/${modelType}/:id`, () => {
            it(`should throw 404 when ${modelName} does not exist`, (done) => {
                chai.request(server.app)
                    .get(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.eql({
                        data: null,
                        errors: [{
                                status: 404,
                                title: 'Not Found',
                                detail: `No ${modelType} found with the id of 1`
                            }]
                    });
                    done();
                });
            });
            it(`should retrieve ${modelName} by id`, (done) => {
                let modelDefinition = Factory.build(modelName);
                model.create(modelDefinition);
                chai.request(server.app)
                    .get(`/api/${modelType}/${modelDefinition.id}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.type.should.be.eql(modelType);
                    res.body.data.id.should.be.eql(String(modelDefinition.id));
                    res.body.links.self.should.be.eql(`http://localhost:3000/api/${modelType}/${modelDefinition.id}`);
                    done();
                });
            });
        });
        describe(`POST /api/${modelType}`, () => {
            it(`should throw 422 when \`data\` member does not exist`, (done) => {
                chai.request(server.app)
                    .post(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({})
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should throw 422 when \`data.type\` member does not exist`, (done) => {
                chai.request(server.app)
                    .post(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {}
                })
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should throw 403 when \`id\` member is defined by client`, (done) => {
                chai.request(server.app)
                    .post(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        type: modelType,
                        id: 583
                    }
                })
                    .end((err, res) => {
                    res.should.have.status(403);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should create ${modelName}`, (done) => {
                let modelDefinition = Factory.build(modelName);
                modelDefinition.id = 1;
                let attrs = {};
                Object.keys(modelDefinition).forEach(key => {
                    if (key !== 'id') {
                        attrs[key] = modelDefinition[key];
                    }
                });
                chai.request(server.app)
                    .post(`/api/${modelType}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        type: modelType,
                        attributes: attrs
                    }
                })
                    .end((err, res) => {
                    res.should.have.status(201);
                    res.body.data.type.should.be.eql(modelType);
                    res.body.data.id.should.be.eql('1');
                    done();
                });
            });
        });
        describe(`PATCH /api/${modelType}`, () => {
            let modelDefinition = Factory.build(modelName);
            modelDefinition.id = 1;
            let modelDefinition2 = Factory.build(modelName);
            modelDefinition2.id = 1;
            let attrs2 = {};
            Object.keys(modelDefinition2).forEach(key => {
                if (['id', 'createdAt', 'updatedAt'].indexOf(key) === -1) {
                    attrs2[key] = modelDefinition2[key];
                }
            });
            it(`should throw 422 when \`data\` member does not exist`, (done) => {
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({})
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should throw 422 when \`data.type\` member does not exist`, (done) => {
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        id: 1
                    }
                })
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should throw 422 when \`data.id\` member does not exist`, (done) => {
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        type: modelType
                    }
                })
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(1);
                    done();
                });
            });
            it(`should throw 422 when \`data.id\` and \`data.type\` members do not exist`, (done) => {
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {}
                })
                    .end((err, res) => {
                    res.should.have.status(422);
                    res.body.errors.length.should.be.eql(2);
                    done();
                });
            });
            it(`should throw 404 when ${modelName} does not exist`, (done) => {
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        type: modelType,
                        id: 1,
                        attributes: attrs2
                    }
                })
                    .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.eql({
                        data: null,
                        errors: [{
                                status: 404,
                                title: 'Not Found',
                                detail: `No ${modelType} found with the id of 1`
                            }]
                    });
                    done();
                });
            });
            it(`should update ${modelName}`, (done) => {
                model.create(modelDefinition);
                chai.request(server.app)
                    .patch(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send({
                    data: {
                        type: modelType,
                        id: 1,
                        attributes: attrs2
                    }
                })
                    .end((err, res) => {
                    let actualAttrs = res.body.data.attributes;
                    let expectedAttrs = {};
                    Object.keys(attrs2).forEach(key => {
                        let dasherized = StringUtils.convertCamelToDasherized(key);
                        expectedAttrs[dasherized] = attrs2[key];
                    });
                    res.should.have.status(200);
                    res.body.data.type.should.be.eql(modelType);
                    Object.keys(expectedAttrs).forEach(expectedKey => {
                        actualAttrs[expectedKey].should.be.eql(expectedAttrs[expectedKey]);
                    });
                    done();
                });
            });
        });
        describe(`DELETE /api/${modelType}/:id`, () => {
            it(`should throw 404 when ${modelName} does not exist`, (done) => {
                chai.request(server.app)
                    .del(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.eql({
                        data: null,
                        errors: [{
                                status: 404,
                                title: 'Not Found',
                                detail: `No ${modelType} found with the id of 1`
                            }]
                    });
                    done();
                });
            });
            it(`should delete ${modelName}`, (done) => {
                let modelDefinition = Factory.build(modelName);
                modelDefinition.id = 1;
                model.create(modelDefinition);
                chai.request(server.app)
                    .del(`/api/${modelType}/1`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .end((err, res) => {
                    res.should.have.status(204);
                    res.body.should.be.eql({});
                    chai.request(server.app)
                        .get(`/api/${modelType}/${modelDefinition.id}`)
                        .set('Content-Type', 'application/vnd.api+json')
                        .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.be.eql({
                            data: null,
                            errors: [{
                                    status: 404,
                                    title: 'Not Found',
                                    detail: `No ${modelType} found with the id of 1`
                                }]
                        });
                        done();
                    });
                });
            });
        });
    });
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvYXBpLWdlbmVyaWMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0FBRTlCLDZCQUE2QjtBQUM3QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDOUMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFakQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVuQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBRTdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVM7SUFDbkMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQ2xDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQ2pELENBQUM7SUFFRixRQUFRLENBQUMsZ0NBQWdDLFNBQVMsRUFBRSxFQUFFO1FBQ3BELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztRQUVyQixVQUFVLENBQUMsQ0FBQyxJQUFJO1lBQ2QsU0FBUyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVsQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dC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QUUsQ0FBQztvQ0FDUCxNQUFNLEVBQUUsR0FBRztvQ0FDWCxLQUFLLEVBQUUsV0FBVztvQ0FDbEIsTUFBTSxFQUFFLE1BQU0sU0FBUyx5QkFBeUI7aUNBQ2pELENBQUM7eUJBQ0gsQ0FBQyxDQUFDO3dCQUVILElBQUksRUFBRSxDQUFDO29CQUNULENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC9hcGktZ2VuZXJpYy50ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5wcm9jZXNzLmVudi5OT0RFX0VOViA9ICd0ZXN0JztcblxuaW1wb3J0ICogYXMgY2hhaSBmcm9tICdjaGFpJztcbmNvbnN0IGNoYWlIdHRwID0gcmVxdWlyZSgnY2hhaS1odHRwJyk7XG5jb25zdCBGYWN0b3J5ID0gcmVxdWlyZSgnLi8uLi9mYWN0b3JpZXMvYWxsJyk7XG5jb25zdCBpbmZsZWN0aW9uID0gcmVxdWlyZSgnaW5mbGVjdGlvbicpO1xuY29uc3Qgc2VydmVyID0gcmVxdWlyZSgnLi4vc2VydmVyJyk7XG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJyk7XG5jb25zdCBTdHJpbmdVdGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMvU3RyaW5nJyk7XG5cbmNoYWkuc2hvdWxkKCk7XG5jaGFpLnVzZShjaGFpSHR0cCk7XG5cbmNvbnN0IG1vZGVscyA9IHNlcnZlci5tb2RlbHM7XG5cbk9iamVjdC5rZXlzKG1vZGVscykuZm9yRWFjaChtb2RlbE5hbWUgPT4ge1xuICBsZXQgbW9kZWwgPSBtb2RlbHNbbW9kZWxOYW1lXTtcbiAgbGV0IG1vZGVsVHlwZSA9IGluZmxlY3Rpb24ucGx1cmFsaXplKFxuICAgIFN0cmluZ1V0aWxzLmNvbnZlcnRDYW1lbFRvRGFzaGVyaXplZChtb2RlbC5uYW1lKVxuICApO1xuXG4gIGRlc2NyaWJlKGBBUEkgLSBnZW5lcmljIHRlc3QgZm9yIG1vZGVsICR7bW9kZWxUeXBlfWAsICgpID0+IHtcbiAgICBsZXQgZmFrZUNsb2NrID0gbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKGRvbmUpID0+IHtcbiAgICAgIGZha2VDbG9jayA9IHNpbm9uLnVzZUZha2VUaW1lcnMoKTtcblxuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBzZXJ2ZXIuZGIucXVlcnkoJ1RSVU5DQVRFIHVzZXJzJyksXG4gICAgICAgIHNlcnZlci5kYi5xdWVyeSgnVFJVTkNBVEUgcG9zdHMnKVxuICAgICAgXSkudGhlbigoKSA9PiBkb25lKCkpO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgIGZha2VDbG9jay5yZXN0b3JlKCk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShgR0VUIC9hcGkvJHttb2RlbFR5cGV9YCwgKCkgPT4ge1xuICAgICAgaXQoYHNob3VsZCByZXR1cm4gZW1wdHkgYXJyYXkgd2hlbiBubyAke21vZGVsVHlwZX0gZXhpc3RgLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAuZ2V0KGAvYXBpLyR7bW9kZWxUeXBlfWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGEuc2hvdWxkLmJlLmVxbChbXSk7XG5cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdChgc2hvdWxkIHJldHVybiBhbiBhcnJheSBvZiAke21vZGVsVHlwZX1gLCAoZG9uZSkgPT4ge1xuICAgICAgICBsZXQgbW9kZWxEZWZpbml0aW9ucyA9IEZhY3RvcnkuYnVpbGRMaXN0KG1vZGVsTmFtZSwgMik7XG5cbiAgICAgICAgbW9kZWxEZWZpbml0aW9ucy5mb3JFYWNoKChkZWYsIGluZGV4KSA9PiB7XG4gICAgICAgICAgZGVmLmlkID0gaW5kZXggKyAxO1xuICAgICAgICAgIG1vZGVsLmNyZWF0ZShkZWYpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAuZ2V0KGAvYXBpLyR7bW9kZWxUeXBlfWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAwKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGEubGVuZ3RoLnNob3VsZC5iZS5lcWwoMik7XG4gICAgICAgICAgICByZXMuYm9keS5kYXRhWzBdLnR5cGUuc2hvdWxkLmJlLmVxbChtb2RlbFR5cGUpO1xuICAgICAgICAgICAgcmVzLmJvZHkuZGF0YVsxXS50eXBlLnNob3VsZC5iZS5lcWwobW9kZWxUeXBlKTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShgR0VUIC9hcGkvJHttb2RlbFR5cGV9LzppZGAsICgpID0+IHtcbiAgICAgIGl0KGBzaG91bGQgdGhyb3cgNDA0IHdoZW4gJHttb2RlbE5hbWV9IGRvZXMgbm90IGV4aXN0YCwgKGRvbmUpID0+IHtcbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlci5hcHApXG4gICAgICAgICAgLmdldChgL2FwaS8ke21vZGVsVHlwZX0vMWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDA0KTtcbiAgICAgICAgICAgIHJlcy5ib2R5LnNob3VsZC5iZS5lcWwoe1xuICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICBlcnJvcnM6IFt7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiA0MDQsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdOb3QgRm91bmQnLFxuICAgICAgICAgICAgICAgIGRldGFpbDogYE5vICR7bW9kZWxUeXBlfSBmb3VuZCB3aXRoIHRoZSBpZCBvZiAxYFxuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdChgc2hvdWxkIHJldHJpZXZlICR7bW9kZWxOYW1lfSBieSBpZGAsIChkb25lKSA9PiB7XG4gICAgICAgIGxldCBtb2RlbERlZmluaXRpb24gPSBGYWN0b3J5LmJ1aWxkKG1vZGVsTmFtZSk7XG5cbiAgICAgICAgbW9kZWwuY3JlYXRlKG1vZGVsRGVmaW5pdGlvbik7XG5cbiAgICAgICAgY2hhaS5yZXF1ZXN0KHNlcnZlci5hcHApXG4gICAgICAgICAgLmdldChgL2FwaS8ke21vZGVsVHlwZX0vJHttb2RlbERlZmluaXRpb24uaWR9YClcbiAgICAgICAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vdm5kLmFwaStqc29uJylcbiAgICAgICAgICAuZW5kKChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xuICAgICAgICAgICAgcmVzLmJvZHkuZGF0YS50eXBlLnNob3VsZC5iZS5lcWwobW9kZWxUeXBlKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGEuaWQuc2hvdWxkLmJlLmVxbChTdHJpbmcobW9kZWxEZWZpbml0aW9uLmlkKSk7XG4gICAgICAgICAgICByZXMuYm9keS5saW5rcy5zZWxmLnNob3VsZC5iZS5lcWwoYGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvJHttb2RlbFR5cGV9LyR7bW9kZWxEZWZpbml0aW9uLmlkfWApO1xuXG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKGBQT1NUIC9hcGkvJHttb2RlbFR5cGV9YCwgKCkgPT4ge1xuICAgICAgaXQoYHNob3VsZCB0aHJvdyA0MjIgd2hlbiBcXGBkYXRhXFxgIG1lbWJlciBkb2VzIG5vdCBleGlzdGAsIChkb25lKSA9PiB7XG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wb3N0KGAvYXBpLyR7bW9kZWxUeXBlfWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe30pXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDIyKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmVycm9ycy5sZW5ndGguc2hvdWxkLmJlLmVxbCgxKTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KGBzaG91bGQgdGhyb3cgNDIyIHdoZW4gXFxgZGF0YS50eXBlXFxgIG1lbWJlciBkb2VzIG5vdCBleGlzdGAsIChkb25lKSA9PiB7XG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wb3N0KGAvYXBpLyR7bW9kZWxUeXBlfWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe1xuICAgICAgICAgICAgZGF0YToge31cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5lbmQoKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQyMik7XG4gICAgICAgICAgICByZXMuYm9keS5lcnJvcnMubGVuZ3RoLnNob3VsZC5iZS5lcWwoMSk7XG5cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdChgc2hvdWxkIHRocm93IDQwMyB3aGVuIFxcYGlkXFxgIG1lbWJlciBpcyBkZWZpbmVkIGJ5IGNsaWVudGAsIChkb25lKSA9PiB7XG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wb3N0KGAvYXBpLyR7bW9kZWxUeXBlfWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0eXBlOiBtb2RlbFR5cGUsXG4gICAgICAgICAgICAgIGlkOiA1ODNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5lbmQoKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDQwMyk7XG4gICAgICAgICAgICByZXMuYm9keS5lcnJvcnMubGVuZ3RoLnNob3VsZC5iZS5lcWwoMSk7XG5cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpdChgc2hvdWxkIGNyZWF0ZSAke21vZGVsTmFtZX1gLCAoZG9uZSkgPT4ge1xuICAgICAgICBsZXQgbW9kZWxEZWZpbml0aW9uID0gRmFjdG9yeS5idWlsZChtb2RlbE5hbWUpO1xuICAgICAgICBtb2RlbERlZmluaXRpb24uaWQgPSAxO1xuICAgICAgICBsZXQgYXR0cnMgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhtb2RlbERlZmluaXRpb24pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICBpZiAoa2V5ICE9PSAnaWQnKSB7XG4gICAgICAgICAgICBhdHRyc1trZXldID0gbW9kZWxEZWZpbml0aW9uW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAucG9zdChgL2FwaS8ke21vZGVsVHlwZX1gKVxuICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgIC5zZW5kKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogbW9kZWxUeXBlLFxuICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoMjAxKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmRhdGEudHlwZS5zaG91bGQuYmUuZXFsKG1vZGVsVHlwZSk7XG4gICAgICAgICAgICByZXMuYm9keS5kYXRhLmlkLnNob3VsZC5iZS5lcWwoJzEnKTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShgUEFUQ0ggL2FwaS8ke21vZGVsVHlwZX1gLCAoKSA9PiB7XG4gICAgICBsZXQgbW9kZWxEZWZpbml0aW9uID0gRmFjdG9yeS5idWlsZChtb2RlbE5hbWUpO1xuICAgICAgbW9kZWxEZWZpbml0aW9uLmlkID0gMTtcblxuICAgICAgbGV0IG1vZGVsRGVmaW5pdGlvbjIgPSBGYWN0b3J5LmJ1aWxkKG1vZGVsTmFtZSk7XG4gICAgICBtb2RlbERlZmluaXRpb24yLmlkID0gMTtcbiAgICAgIGxldCBhdHRyczIgPSB7fTtcblxuICAgICAgT2JqZWN0LmtleXMobW9kZWxEZWZpbml0aW9uMikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAoWydpZCcsICdjcmVhdGVkQXQnLCAndXBkYXRlZEF0J10uaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgICAgIGF0dHJzMltrZXldID0gbW9kZWxEZWZpbml0aW9uMltrZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaXQoYHNob3VsZCB0aHJvdyA0MjIgd2hlbiBcXGBkYXRhXFxgIG1lbWJlciBkb2VzIG5vdCBleGlzdGAsIChkb25lKSA9PiB7XG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wYXRjaChgL2FwaS8ke21vZGVsVHlwZX0vMWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe30pXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDIyKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmVycm9ycy5sZW5ndGguc2hvdWxkLmJlLmVxbCgxKTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KGBzaG91bGQgdGhyb3cgNDIyIHdoZW4gXFxgZGF0YS50eXBlXFxgIG1lbWJlciBkb2VzIG5vdCBleGlzdGAsIChkb25lKSA9PiB7XG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wYXRjaChgL2FwaS8ke21vZGVsVHlwZX0vMWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBpZDogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zaG91bGQuaGF2ZS5zdGF0dXMoNDIyKTtcbiAgICAgICAgICAgIHJlcy5ib2R5LmVycm9ycy5sZW5ndGguc2hvdWxkLmJlLmVxbCgxKTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KGBzaG91bGQgdGhyb3cgNDIyIHdoZW4gXFxgZGF0YS5pZFxcYCBtZW1iZXIgZG9lcyBub3QgZXhpc3RgLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAucGF0Y2goYC9hcGkvJHttb2RlbFR5cGV9LzFgKVxuICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgIC5zZW5kKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogbW9kZWxUeXBlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZW5kKChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MjIpO1xuICAgICAgICAgICAgcmVzLmJvZHkuZXJyb3JzLmxlbmd0aC5zaG91bGQuYmUuZXFsKDEpO1xuXG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoYHNob3VsZCB0aHJvdyA0MjIgd2hlbiBcXGBkYXRhLmlkXFxgIGFuZCBcXGBkYXRhLnR5cGVcXGAgbWVtYmVycyBkbyBub3QgZXhpc3RgLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAucGF0Y2goYC9hcGkvJHttb2RlbFR5cGV9LzFgKVxuICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgIC5zZW5kKHtcbiAgICAgICAgICAgIGRhdGE6IHt9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZW5kKChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MjIpO1xuICAgICAgICAgICAgcmVzLmJvZHkuZXJyb3JzLmxlbmd0aC5zaG91bGQuYmUuZXFsKDIpO1xuXG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoYHNob3VsZCB0aHJvdyA0MDQgd2hlbiAke21vZGVsTmFtZX0gZG9lcyBub3QgZXhpc3RgLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAucGF0Y2goYC9hcGkvJHttb2RlbFR5cGV9LzFgKVxuICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgIC5zZW5kKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgdHlwZTogbW9kZWxUeXBlLFxuICAgICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgICAgYXR0cmlidXRlczogYXR0cnMyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZW5kKChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmVxbCh7XG4gICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgIGVycm9yczogW3tcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDQwNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ05vdCBGb3VuZCcsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBgTm8gJHttb2RlbFR5cGV9IGZvdW5kIHdpdGggdGhlIGlkIG9mIDFgXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KGBzaG91bGQgdXBkYXRlICR7bW9kZWxOYW1lfWAsIChkb25lKSA9PiB7XG4gICAgICAgIG1vZGVsLmNyZWF0ZShtb2RlbERlZmluaXRpb24pO1xuXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5wYXRjaChgL2FwaS8ke21vZGVsVHlwZX0vMWApXG4gICAgICAgICAgLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbicpXG4gICAgICAgICAgLnNlbmQoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0eXBlOiBtb2RlbFR5cGUsXG4gICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyczJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5lbmQoKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYWN0dWFsQXR0cnMgPSByZXMuYm9keS5kYXRhLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBsZXQgZXhwZWN0ZWRBdHRycyA9IHt9O1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhhdHRyczIpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgbGV0IGRhc2hlcml6ZWQgPSBTdHJpbmdVdGlscy5jb252ZXJ0Q2FtZWxUb0Rhc2hlcml6ZWQoa2V5KTtcblxuICAgICAgICAgICAgICBleHBlY3RlZEF0dHJzW2Rhc2hlcml6ZWRdID0gYXR0cnMyW2tleV07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cygyMDApO1xuICAgICAgICAgICAgcmVzLmJvZHkuZGF0YS50eXBlLnNob3VsZC5iZS5lcWwobW9kZWxUeXBlKTtcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZXhwZWN0ZWRBdHRycykuZm9yRWFjaChleHBlY3RlZEtleSA9PiB7XG4gICAgICAgICAgICAgIGFjdHVhbEF0dHJzW2V4cGVjdGVkS2V5XS5zaG91bGQuYmUuZXFsKGV4cGVjdGVkQXR0cnNbZXhwZWN0ZWRLZXldKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKGBERUxFVEUgL2FwaS8ke21vZGVsVHlwZX0vOmlkYCwgKCkgPT4ge1xuICAgICAgaXQoYHNob3VsZCB0aHJvdyA0MDQgd2hlbiAke21vZGVsTmFtZX0gZG9lcyBub3QgZXhpc3RgLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGFpLnJlcXVlc3Qoc2VydmVyLmFwcClcbiAgICAgICAgICAuZGVsKGAvYXBpLyR7bW9kZWxUeXBlfS8xYClcbiAgICAgICAgICAuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vdm5kLmFwaStqc29uJylcbiAgICAgICAgICAuZW5kKChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xuICAgICAgICAgICAgcmVzLmJvZHkuc2hvdWxkLmJlLmVxbCh7XG4gICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgIGVycm9yczogW3tcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDQwNCxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ05vdCBGb3VuZCcsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBgTm8gJHttb2RlbFR5cGV9IGZvdW5kIHdpdGggdGhlIGlkIG9mIDFgXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KGBzaG91bGQgZGVsZXRlICR7bW9kZWxOYW1lfWAsIChkb25lKSA9PiB7XG4gICAgICAgIGxldCBtb2RlbERlZmluaXRpb24gPSBGYWN0b3J5LmJ1aWxkKG1vZGVsTmFtZSk7XG4gICAgICAgIG1vZGVsRGVmaW5pdGlvbi5pZCA9IDE7XG4gICAgICAgIG1vZGVsLmNyZWF0ZShtb2RlbERlZmluaXRpb24pO1xuXG4gICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgIC5kZWwoYC9hcGkvJHttb2RlbFR5cGV9LzFgKVxuICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgIC5lbmQoKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICByZXMuc2hvdWxkLmhhdmUuc3RhdHVzKDIwNCk7XG4gICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuZXFsKHt9KTtcblxuICAgICAgICAgIGNoYWkucmVxdWVzdChzZXJ2ZXIuYXBwKVxuICAgICAgICAgICAgLmdldChgL2FwaS8ke21vZGVsVHlwZX0vJHttb2RlbERlZmluaXRpb24uaWR9YClcbiAgICAgICAgICAgIC5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nKVxuICAgICAgICAgICAgLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgcmVzLnNob3VsZC5oYXZlLnN0YXR1cyg0MDQpO1xuICAgICAgICAgICAgICByZXMuYm9keS5zaG91bGQuYmUuZXFsKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yczogW3tcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgICAgICAgICAgdGl0bGU6ICdOb3QgRm91bmQnLFxuICAgICAgICAgICAgICAgICAgZGV0YWlsOiBgTm8gJHttb2RlbFR5cGV9IGZvdW5kIHdpdGggdGhlIGlkIG9mIDFgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
