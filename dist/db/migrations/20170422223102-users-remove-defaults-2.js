'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        // Remove the defaultValue from the email column
        queryInterface.changeColumn('users', 'email', {
            type: Sequelize.STRING,
            allowNull: false
        });
        // Remove the defaultValue from the passwordHash column
        queryInterface.changeColumn('users', 'passwordHash', {
            type: Sequelize.STRING,
            allowNull: false
        });
    },
    down: function (queryInterface, Sequelize) {
        // Put the defaultValue back onto the email column
        queryInterface.changeColumn('users', 'email', {
            type: Sequelize.STRING,
            defaultValue: false,
            allowNull: false,
        });
        // Put the defaultValue back onto the passwordHash column
        queryInterface.changeColumn('users', 'passwordHash', {
            type: Sequelize.STRING,
            defaultValue: false,
            allowNull: false,
        });
    }
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL21pZ3JhdGlvbnMvMjAxNzA0MjIyMjMxMDItdXNlcnMtcmVtb3ZlLWRlZmF1bHRzLTIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNmLEVBQUUsRUFBRSxVQUFVLGNBQWMsRUFBRSxTQUFTO1FBRXJDLGdEQUFnRDtRQUNoRCxjQUFjLENBQUMsWUFBWSxDQUN6QixPQUFPLEVBQ1AsT0FBTyxFQUNQO1lBQ0UsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3RCLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztRQUVMLHVEQUF1RDtRQUN2RCxjQUFjLENBQUMsWUFBWSxDQUN6QixPQUFPLEVBQ1AsY0FBYyxFQUNkO1lBQ0UsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3RCLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxJQUFJLEVBQUUsVUFBVSxjQUFjLEVBQUUsU0FBUztRQUV2QyxrREFBa0Q7UUFDbEQsY0FBYyxDQUFDLFlBQVksQ0FDekIsT0FBTyxFQUNQLE9BQU8sRUFDUDtZQUNFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixZQUFZLEVBQUUsS0FBSztZQUNuQixTQUFTLEVBQUUsS0FBSztTQUNqQixDQUFDLENBQUM7UUFFTCx5REFBeUQ7UUFDekQsY0FBYyxDQUFDLFlBQVksQ0FDekIsT0FBTyxFQUNQLGNBQWMsRUFDZDtZQUNFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN0QixZQUFZLEVBQUUsS0FBSztZQUNuQixTQUFTLEVBQUUsS0FBSztTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0YsQ0FBQyIsImZpbGUiOiJkYi9taWdyYXRpb25zLzIwMTcwNDIyMjIzMTAyLXVzZXJzLXJlbW92ZS1kZWZhdWx0cy0yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdXA6IGZ1bmN0aW9uIChxdWVyeUludGVyZmFjZSwgU2VxdWVsaXplKSB7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGRlZmF1bHRWYWx1ZSBmcm9tIHRoZSBlbWFpbCBjb2x1bW5cbiAgICBxdWVyeUludGVyZmFjZS5jaGFuZ2VDb2x1bW4oXG4gICAgICAndXNlcnMnLFxuICAgICAgJ2VtYWlsJyxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLlNUUklORyxcbiAgICAgICAgYWxsb3dOdWxsOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGRlZmF1bHRWYWx1ZSBmcm9tIHRoZSBwYXNzd29yZEhhc2ggY29sdW1uXG4gICAgcXVlcnlJbnRlcmZhY2UuY2hhbmdlQ29sdW1uKFxuICAgICAgJ3VzZXJzJyxcbiAgICAgICdwYXNzd29yZEhhc2gnLFxuICAgICAge1xuICAgICAgICB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HLFxuICAgICAgICBhbGxvd051bGw6IGZhbHNlXG4gICAgICB9KTtcbiAgfSxcblxuICBkb3duOiBmdW5jdGlvbiAocXVlcnlJbnRlcmZhY2UsIFNlcXVlbGl6ZSkge1xuXG4gICAgLy8gUHV0IHRoZSBkZWZhdWx0VmFsdWUgYmFjayBvbnRvIHRoZSBlbWFpbCBjb2x1bW5cbiAgICBxdWVyeUludGVyZmFjZS5jaGFuZ2VDb2x1bW4oXG4gICAgICAndXNlcnMnLFxuICAgICAgJ2VtYWlsJyxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogU2VxdWVsaXplLlNUUklORyxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgICAgYWxsb3dOdWxsOiBmYWxzZSxcbiAgICAgIH0pO1xuXG4gICAgLy8gUHV0IHRoZSBkZWZhdWx0VmFsdWUgYmFjayBvbnRvIHRoZSBwYXNzd29yZEhhc2ggY29sdW1uXG4gICAgcXVlcnlJbnRlcmZhY2UuY2hhbmdlQ29sdW1uKFxuICAgICAgJ3VzZXJzJyxcbiAgICAgICdwYXNzd29yZEhhc2gnLFxuICAgICAge1xuICAgICAgICB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgICAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgICAgfSk7XG4gIH1cbn07XG4iXX0=
