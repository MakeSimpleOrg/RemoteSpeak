angular.module('deviceApp', ['smart-table'])
.controller('DeviceSettingsController', function($scope) {
        var vm = this;
        vm.errorMessage = '';
        vm.homey;
        vm.setHomey = function(homey, scope) {
            vm.homey = homey;
            vm.homey.get('devices', function(err, newDevices) {
                //console.log('devices: ' + JSON.stringify(newDevices));
                if (!newDevices)
                    newDevices = [];
                vm.devices = newDevices;
                scope.$apply(function() { vm.devices = newDevices; });
            });
		};
		vm.addDevice = function() {
            if (vm.devices && vm.devices.filter(function(e) { return e.name == vm.newDevice.name; }).length > 0) {
                vm.errorMessage = "Device does already exist in database.";
                return;
            }
            var device = {
                name: vm.newDevice.name,
                token: vm.newDevice.token
            };
            vm.devices.push(device);
			//console.log('addDevice: ' + JSON.stringify(vm.devices));
            storeDevices(angular.copy(vm.devices));
            vm.errorMessage = '';
        };
        vm.removeDevice = function(row) {
            var index = vm.devices.indexOf(row);
            vm.devices.splice(index, 1);
            storeDevices(angular.copy(vm.devices));
		};
        vm.getTemplate = function(variable) {
            return 'display';
        };
        function storeDevices(devices) {
            //console.log('storeDevices: ' + JSON.stringify(devices));
            vm.homey.set('devices', devices);
		};
});