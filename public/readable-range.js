// modified Ben Leather, July 2015, added lim.
(function(moment) {
    var STRINGS = {
        nodiff: '',
        year: 'year',
        years: 'years',
        month: 'month',
        months: 'months',
        day: 'day',
        days: 'days',
        hour: 'hour',
        hours: 'hours',
        minute: 'minute',
        minutes: 'minutes',
        second: 'second',
        seconds: 'seconds',
        delimiter: ' '
    };
    moment.fn.preciseDiff = function(d2, lim) {
        return moment.preciseDiff(this, d2, lim);
    };
    moment.preciseDiff = function(d1, d2, lim) {
        var m1 = moment(d1), m2 = moment(d2);
        if (m1.isSame(m2)) {
            return STRINGS.nodiff;
        }
        if (m1.isAfter(m2)) {
            var tmp = m1;
            m1 = m2;
            m2 = tmp;
        }
		if (!lim) {
			lim = 3;
		}
        var yDiff = m2.year() - m1.year();
        var mDiff = m2.month() - m1.month();
        var dDiff = m2.date() - m1.date();
        var hourDiff = m2.hour() - m1.hour();
        var minDiff = m2.minute() - m1.minute();
        var secDiff = m2.second() - m1.second();

        if (secDiff < 0) {
            secDiff = 60 + secDiff;
            minDiff--;
        }
        if (minDiff < 0) {
            minDiff = 60 + minDiff;
            hourDiff--;
        }
        if (hourDiff < 0) {
            hourDiff = 24 + hourDiff;
            dDiff--;
        }
        if (dDiff < 0) {
            var daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();
            if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
                dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
            } else {
                dDiff = daysInLastFullMonth + dDiff;
            }
            mDiff--;
        }
        if (mDiff < 0) {
            mDiff = 12 + mDiff;
            yDiff--;
        }

        function pluralize(num, word) {
            return '<li>' + num + ' <span class="time-units">' + STRINGS[word + (num === 1 ? '' : 's')] + '</span></li>';
        }
        var result = [];
		var terms = 0;
		
        if (yDiff && terms < lim) {
            result.push(pluralize(yDiff, 'year'));
            terms++;
        }
        if (mDiff && terms < lim) {
            result.push(pluralize(mDiff, 'month'));
            terms++;
        }
        if (dDiff && terms < lim) {
            result.push(pluralize(dDiff, 'day'));
            terms++;
        }
        if (hourDiff && terms < lim) {
            result.push(pluralize(hourDiff, 'hour'));
            terms++;
        }
        if (minDiff && terms < lim) {
            result.push(pluralize(minDiff, 'minute'));
            terms++;
        }
        if (secDiff && terms < lim) {
            result.push(pluralize(secDiff, 'second'));
            terms++;
        }

        return '<ul>' + result.join(STRINGS.delimiter) + '</ul>';
    };
}(moment));
