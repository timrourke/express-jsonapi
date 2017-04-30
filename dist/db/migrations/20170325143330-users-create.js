'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('users', {
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
            firstName: {
                type: Sequelize.STRING,
                defaultValue: false,
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING,
                defaultValue: false,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                defaultValue: false,
                allowNull: false
            },
            passwordHash: {
                type: Sequelize.STRING,
                defaultValue: false,
                allowNull: false
            }
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('users');
    }
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL21pZ3JhdGlvbnMvMjAxNzAzMjUxNDMzMzAtdXNlcnMtY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixFQUFFLEVBQUUsVUFBVSxjQUFjLEVBQUUsU0FBUztRQUNyQyxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7WUFDekMsRUFBRSxFQUFFO2dCQUNGLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTztnQkFDdkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGFBQWEsRUFBRSxJQUFJO2FBQ3BCO1lBQ0QsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTthQUNyQjtZQUNELFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7YUFDckI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO2dCQUN0QixZQUFZLEVBQUUsS0FBSztnQkFDbkIsU0FBUyxFQUFFLEtBQUs7YUFDakI7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO2dCQUN0QixZQUFZLEVBQUUsS0FBSztnQkFDbkIsU0FBUyxFQUFFLEtBQUs7YUFDakI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO2dCQUN0QixZQUFZLEVBQUUsS0FBSztnQkFDbkIsU0FBUyxFQUFFLEtBQUs7YUFDakI7WUFDRCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO2dCQUN0QixZQUFZLEVBQUUsS0FBSztnQkFDbkIsU0FBUyxFQUFFLEtBQUs7YUFDakI7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxFQUFFLFVBQVUsY0FBYyxFQUFFLFNBQVM7UUFDdkMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNGLENBQUMiLCJmaWxlIjoiZGIvbWlncmF0aW9ucy8yMDE3MDMyNTE0MzMzMC11c2Vycy1jcmVhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cDogZnVuY3Rpb24gKHF1ZXJ5SW50ZXJmYWNlLCBTZXF1ZWxpemUpIHtcbiAgICByZXR1cm4gcXVlcnlJbnRlcmZhY2UuY3JlYXRlVGFibGUoJ3VzZXJzJywge1xuICAgICAgaWQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsXG4gICAgICAgIHByaW1hcnlLZXk6IHRydWUsXG4gICAgICAgIGF1dG9JbmNyZW1lbnQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLkRBVEVcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLkRBVEVcbiAgICAgIH0sXG4gICAgICBmaXJzdE5hbWU6IHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLlNUUklORyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgICAgYWxsb3dOdWxsOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGxhc3ROYW1lOiB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICAgIGFsbG93TnVsbDogZmFsc2VcbiAgICAgIH0sXG4gICAgICBlbWFpbDoge1xuICAgICAgICB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgICAgICBhbGxvd051bGw6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmRIYXNoOiB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICAgIGFsbG93TnVsbDogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBkb3duOiBmdW5jdGlvbiAocXVlcnlJbnRlcmZhY2UsIFNlcXVlbGl6ZSkge1xuICAgIHJldHVybiBxdWVyeUludGVyZmFjZS5kcm9wVGFibGUoJ3VzZXJzJyk7XG4gIH1cbn07XG4iXX0=
