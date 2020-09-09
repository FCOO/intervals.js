/****************************************************************************
    intervals.js,

    (c) 2020, FCOO

    https://github.com/FCOO/intervals
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    function Intervals(options) {
        this.options = $.extend({
            format      : 'JSON',
            durationUnit: 'seconds', //'minutes'
            promiseOptions: {
                noCache: true,
            }
        }, options || {} );

        this.durationList = []; //[]{lastFloorMoment: MOMENT, list: []{fileNameOrData, resolve}


    }

    Intervals.prototype = {
        isFileName: function(fileNameOrData){
            return $.type(fileNameOrData) == 'string';
        },
        getFileName: function(fileName){
            return fileName;
        },

        /*************************************************************************
        addInterval(options)
        options: {duration, fileNameOrData, resolve, context, wait, format, promiseOptions}
        Add a reload of fileNameOrData with resolve-function
        Will reload every rounded duration. Eq duration = "10 minutes" => called HH:00, HH:10, HH:20,...
        If wait == false => also call the resolve on creation
        *************************************************************************/
        addInterval: function( options ){
            options = $.extend({}, this.options, options );
            return this.addIntervalObject( new Interval(options, this) );
        },

        addIntervalObject: function( interval, neverWait ){
            var options       = interval.options,
                intervalGroup = this.durationList[options.duration] = this.durationList[options.duration] || {};

            intervalGroup.list = intervalGroup.list || {};
            intervalGroup.list[interval.id] = interval;

            if (!options.wait && !neverWait)
                interval.exec();

            if (!intervalGroup.timeoutId)
                intervalGroup.timeoutId = this.intervalTimeout(options.duration, true);

            return interval;
        },

        /*************************************************************************
        intervalTimeout(durationMinutes, dontResolve)
        *************************************************************************/
        intervalTimeout: function(duration, dontResolve){
            var _this           = this,
                intervalGroup   = this.durationList[duration],
                nowFloorMoment  = moment().floor(duration, this.options.durationUnit),
                nextFloorMoment = moment(nowFloorMoment).add(duration, this.options.durationUnit);

            intervalGroup.timeoutId = null;
            if (!$.isEmptyObject(intervalGroup.list))
                intervalGroup.timeoutId = window.setTimeout( function(){_this.intervalTimeout(duration);}, nextFloorMoment.diff(moment()) );

            //Check if we need to call resolves
            if (!intervalGroup.lastFloorMoment || !nowFloorMoment.isSame(intervalGroup.lastFloorMoment)){
                intervalGroup.lastFloorMoment = nowFloorMoment;
                if (!dontResolve)
                    $.each(intervalGroup.list, function(id, intervalRec){ intervalRec.exec(); });
            }
        },
    };

    // expose access to the constructor
    window.Intervals = Intervals;


    /*************************************************************************
    Interval - Represent one loading of file or data
    *************************************************************************/
    var intervalId = 0;
    function Interval(options, intervals) {
        this.id = 'interval' + intervalId++;
        this.options = $.extend({
        }, options || {} );


        this.options.fileNameOrData = this.options.fileNameOrData || this.options.fileName || this.options.data;
        this.intervals = intervals;

        if (this.options.context){
            this.options.resolve = this.options.resolve ? $.proxy(this.options.resolve, this.options.context) : null;
            this.options.reject  = this.options.reject  ? $.proxy(this.options.reject,  this.options.context) : null;
        }

    }

    Interval.prototype = {
        //setDuration(duration)
        setDuration: function(duration){
            if (duration != this.options.duration){
                if (this.options.duration)
                    //Remove this from the current duration-list
                    this.remove();

                //Add this to new durationList
                this.options.duration = duration;
                this.intervals.addIntervalObject(this, true);
            }
        },

        //remove - Remove this from the current duration-list
        remove: function(){
            delete this.intervals.durationList[this.options.duration].list[this.id];
            return this;
        },

        //paus(period, wait)
        paus: function(period, wait){
            var _this = this;
            this.options.wait = wait !== undefined ? wait : this.options.wait;
            this.remove();
            this.onHold = true;
            window.setTimeout( $.proxy(_this._restart, _this),  moment.duration(period, this.intervals.options.durationUnit).asMilliseconds() );
        },

        _restart: function(){
            this.onHold = false;
            this.intervals.addIntervalObject(this);
        },

        //exec - "Run" the promise for the interval
        exec: function(){
            if (this.onHold) return;

            var _this = this;
            if (this.intervals.isFileName(this.options.fileNameOrData)){
                //File-name is given => load file
                var promiseOptions =
                        $.extend({
                            resolve: this.options.resolve ? function(data) { _this.options.resolve(data,  _this); } : null,
                            reject : this.options.reject  ? function(error){ _this.options.reject (error, _this); } : null
                        }, this.options.promiseOptions);


                var fileName = this.intervals.getFileName(this.options.fileNameOrData);

                switch (this.options.format.toUpperCase()){
                    case 'JSON' : window.Promise.getJSON(fileName, promiseOptions ); break;
                    case 'XML'  : window.Promise.getXML (fileName, promiseOptions ); break;
                    default     : window.Promise.getText(fileName, promiseOptions ); break;
                }
            }
            else
                //Data is given => resolve them
                this.options.resolve(this.options.fileNameOrData);
        }
    };

    //Create default intervals
    window.intervals = new Intervals();

}(jQuery, this, document));