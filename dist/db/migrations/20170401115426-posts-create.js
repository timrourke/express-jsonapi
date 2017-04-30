'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('posts', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            },
            body: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER
            }
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('users');
    }
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL21pZ3JhdGlvbnMvMjAxNzA0MDExMTU0MjYtcG9zdHMtY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixFQUFFLEVBQUUsVUFBVSxjQUFjLEVBQUUsU0FBUztRQUNyQyxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7WUFDekMsRUFBRSxFQUFFO2dCQUNGLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTztnQkFDdkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGFBQWEsRUFBRSxJQUFJO2FBQ3BCO1lBQ0QsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTthQUNyQjtZQUNELFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7YUFDckI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO2dCQUNwQixTQUFTLEVBQUUsS0FBSzthQUNqQjtZQUNELE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU87YUFDeEI7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxFQUFFLFVBQVUsY0FBYyxFQUFFLFNBQVM7UUFDdkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNGLENBQUMiLCJmaWxlIjoiZGIvbWlncmF0aW9ucy8yMDE3MDQwMTExNTQyNi1wb3N0cy1jcmVhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cDogZnVuY3Rpb24gKHF1ZXJ5SW50ZXJmYWNlLCBTZXF1ZWxpemUpIHtcbiAgICByZXR1cm4gcXVlcnlJbnRlcmZhY2UuY3JlYXRlVGFibGUoJ3Bvc3RzJywge1xuICAgICAgaWQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsXG4gICAgICAgIHByaW1hcnlLZXk6IHRydWUsXG4gICAgICAgIGF1dG9JbmNyZW1lbnQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLkRBVEVcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLkRBVEVcbiAgICAgIH0sXG4gICAgICBib2R5OiB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5URVhULFxuICAgICAgICBhbGxvd051bGw6IGZhbHNlXG4gICAgICB9LFxuICAgICAgdXNlcklkOiB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5JTlRFR0VSXG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZG93bjogZnVuY3Rpb24gKHF1ZXJ5SW50ZXJmYWNlLCBTZXF1ZWxpemUpIHtcbiAgICByZXR1cm4gcXVlcnlJbnRlcmZhY2UuZHJvcFRhYmxlKCd1c2VycycpO1xuICB9XG59O1xuIl19
