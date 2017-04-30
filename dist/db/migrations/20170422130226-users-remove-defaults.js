'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        // Remove the defaultValue from the firstName column
        queryInterface.changeColumn('users', 'firstName', {
            type: Sequelize.STRING,
            allowNull: false
        });
        // Remove the defaultValue from the lastName column
        queryInterface.changeColumn('users', 'lastName', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },
    down: function (queryInterface, Sequelize) {
        // Put the defaultValue back onto the firstName column
        queryInterface.changeColumn('users', 'firstName', {
            type: Sequelize.STRING,
            defaultValue: false,
            allowNull: false
        });
        // Put the defaultValue back onto the lastName column
        queryInterface.changeColumn('users', 'lastName', {
            type: Sequelize.STRING,
            defaultValue: false,
            allowNull: false
        });
    }
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL21pZ3JhdGlvbnMvMjAxNzA0MjIxMzAyMjYtdXNlcnMtcmVtb3ZlLWRlZmF1bHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDZixFQUFFLEVBQUUsVUFBVSxjQUFjLEVBQUUsU0FBUztRQUVyQyxvREFBb0Q7UUFDcEQsY0FBYyxDQUFDLFlBQVksQ0FDekIsT0FBTyxFQUNQLFdBQVcsRUFDWDtZQUNFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsS0FBSztTQUNqQixDQUFDLENBQUM7UUFFTCxtREFBbUQ7UUFDbkQsY0FBYyxDQUFDLFlBQVksQ0FDekIsT0FBTyxFQUNQLFVBQVUsRUFDVjtZQUNFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsS0FBSztTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxFQUFFLFVBQVUsY0FBYyxFQUFFLFNBQVM7UUFFdkMsc0RBQXNEO1FBQ3RELGNBQWMsQ0FBQyxZQUFZLENBQ3pCLE9BQU8sRUFDUCxXQUFXLEVBQ1g7WUFDRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDdEIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsU0FBUyxFQUFFLEtBQUs7U0FDakIsQ0FBQyxDQUFDO1FBRUwscURBQXFEO1FBQ3JELGNBQWMsQ0FBQyxZQUFZLENBQ3pCLE9BQU8sRUFDUCxVQUFVLEVBQ1Y7WUFDRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDdEIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsU0FBUyxFQUFFLEtBQUs7U0FDakIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNGLENBQUMiLCJmaWxlIjoiZGIvbWlncmF0aW9ucy8yMDE3MDQyMjEzMDIyNi11c2Vycy1yZW1vdmUtZGVmYXVsdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB1cDogZnVuY3Rpb24gKHF1ZXJ5SW50ZXJmYWNlLCBTZXF1ZWxpemUpIHtcblxuICAgIC8vIFJlbW92ZSB0aGUgZGVmYXVsdFZhbHVlIGZyb20gdGhlIGZpcnN0TmFtZSBjb2x1bW5cbiAgICBxdWVyeUludGVyZmFjZS5jaGFuZ2VDb2x1bW4oXG4gICAgICAndXNlcnMnLFxuICAgICAgJ2ZpcnN0TmFtZScsXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gICAgICAgIGFsbG93TnVsbDogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBkZWZhdWx0VmFsdWUgZnJvbSB0aGUgbGFzdE5hbWUgY29sdW1uXG4gICAgcXVlcnlJbnRlcmZhY2UuY2hhbmdlQ29sdW1uKFxuICAgICAgJ3VzZXJzJyxcbiAgICAgICdsYXN0TmFtZScsXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gICAgICAgIGFsbG93TnVsbDogZmFsc2VcbiAgICAgIH0pO1xuICB9LFxuXG4gIGRvd246IGZ1bmN0aW9uIChxdWVyeUludGVyZmFjZSwgU2VxdWVsaXplKSB7XG5cbiAgICAvLyBQdXQgdGhlIGRlZmF1bHRWYWx1ZSBiYWNrIG9udG8gdGhlIGZpcnN0TmFtZSBjb2x1bW5cbiAgICBxdWVyeUludGVyZmFjZS5jaGFuZ2VDb2x1bW4oXG4gICAgICAndXNlcnMnLFxuICAgICAgJ2ZpcnN0TmFtZScsXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICAgIGFsbG93TnVsbDogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgLy8gUHV0IHRoZSBkZWZhdWx0VmFsdWUgYmFjayBvbnRvIHRoZSBsYXN0TmFtZSBjb2x1bW5cbiAgICBxdWVyeUludGVyZmFjZS5jaGFuZ2VDb2x1bW4oXG4gICAgICAndXNlcnMnLFxuICAgICAgJ2xhc3ROYW1lJyxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLlNUUklORyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgICAgYWxsb3dOdWxsOiBmYWxzZVxuICAgICAgfSk7XG4gIH1cbn07XG4iXX0=
