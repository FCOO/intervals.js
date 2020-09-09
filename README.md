# intervals


## Description
Objects and methods to load data or files with specific intervals. 
The loading will take place at "rounded" times. 
<br>Eq. interval = 10 minutes => Read af HH:00, HH:10, HH20, HH30,..., HH50

Interval > one hour will make make the interval "N*Hour plus rest"
<br>Eq. interval = 70 => Once every hour at HH:10
<br>Eq. interval = 140 => Once every second hour at HH:20 starting "now"

## Installation
### bower
`bower install https://github.com/FCOO/intervals.git --save`

## Demo
http://FCOO.github.io/intervals/demo/ 

## Usage
	var myIntervals = new Intervals( options );
	default options = {
		format: "JSON", 		//Default file-format Possible "XML", "TEXT" or "JSON"
     	durationUnit: 'minutes',
        promiseOptions: {
        	noCache: true
        }
	}

### Methods

    .addInterval(options)
        options: {duration, fileNameOrData, resolve, reject, context, wait, format, promiseOptions}
		Add a reload of fileNameOrData with resolve-function
        Will reload every rounded duration. Eq duration = 10 ("10 minutes") => called HH:00, HH:10, HH:20,...
        If wait == false => also call the resolve on creation
		resolve = function(data, interval:INTERVAL)
    	reject = function(error, interval:INTERVAL)

	INTERVAL represent one file or data being reloaded

### Methods INTERVAL
	.setDuration(duration, wait)	//Change the duration for the INTERVAL
	.paus(period, wait)				//Set the INTERVAL on hold for period minutes


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/intervals/LICENSE).

Copyright (c) 2020 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk
