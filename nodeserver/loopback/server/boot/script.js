// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = function (app) {
    //https://github.com/strongloop/loopback/issues/1441
    var User = app.models.User;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    var Team = app.models.Team;
    var User = app.models.User;



    // Role.destroyAll({}, function () {
        // User.destroyAll({}, function () {
            User.find({ where: { username: 'admin' } }, function (err, users) {
                console.log(users);
                if (!users[0]) {
                    User.create({
                        username: 'admin', email: 'admin@coderuss.com',
                        password: 'admin'
                    }, function (err, user) {
                        if (err) throw err;
                        console.log(users);
                        //create the admin role
                        Role.create({
                            name: 'admin'
                        }, function (err, role) {
                            if (err) throw err;

                            console.log('Created role:', role);

                            //make bob an admin
                            role.principals.create({
                                principalType: RoleMapping.USER,
                                principalId: user.id
                            }, function (err, principal) {
                                if (err) throw err;

                                console.log('Created principal:', principal);
                            });
                        });
                    })
                }
                else {
                    RoleMapping.find({},function(err,mappings) {
                        console.log(mappings);
                    });
    // users[0].roles(null,
                    // function(err, roles) {
                    //     console.log(roles);
                    //     return;
                    //     if (roles.length < 1) {
                    //         Role.create({
                    //         name: 'admin'
                    //     }, function (err, role) {
                    //         if (err) throw err;

                    //         console.log('Created role:', role);

                    //         //make bob an admin
                    //         role.principals.create({
                    //             principalType: RoleMapping.USER,
                    //             principalId: user.id
                    //         }, function (err, principal) {
                    //             if (err) throw err;

                    //             console.log('Created principal:', principal);
                    //         });
                    //     });
                    //     }
                    // });
                }
            // })
        // })


        // User.upsert([
        //     { username: 'John', email: 'john@doe.com', password: 'opensesame' },
        //     { username: 'Jane', email: 'jane@doe.com', password: 'opensesame' },
        //     { username: 'Bob', email: 'bob@projects.com', password: 'opensesame' }
        // ], function (err, users) {
        //     if (err) throw err;

        // console.log('Created users:', users);

        // // create project 1 and make john the owner
        // users[0].projects.create({
        //   name: 'project1',
        //   balance: 100
        // }, function(err, project) {
        //   if (err) throw err;

        //   console.log('Created project:', project);

        //   // add team members
        //   Team.create([
        //     {ownerId: project.ownerId, memberId: users[0].id},
        //     {ownerId: project.ownerId, memberId: users[1].id}
        //   ], function(err, team) {
        //     if (err) throw err;

        //     console.log('Created team:', team);
        //   });
        // });

        // //create project 2 and make jane the owner
        // users[1].projects.create({
        //   name: 'project2',
        //   balance: 100
        // }, function(err, project) {
        //   if (err) throw err;

        //   console.log('Created project:', project);

        //   //add team members
        //   Team.create({
        //     ownerId: project.ownerId,
        //     memberId: users[1].id
        //   }, function(err, team) {
        //     if (err) throw err;

        //     console.log('Created team:', team);
        //   });
        // });


    });

    // });
};