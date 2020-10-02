class Time {


	randomTime(estart, eend) {
		// get the difference between the 2 dates, multiply it by 0-1, 
    	// and add it to the start date to get a new date 
    	var start=new Date(estart);
    	var end=new Date(eend);
    	var diff =  end.getTime() - start.getTime();
    	var new_diff = diff * Math.random();
    	var date = new Date(start.getTime() + new_diff);
    	return date;
    }

    epoch (date) {
    	return Date.parse(date)
    }

}



class StringUtil {

	//Splice with a function to insert text. 
	spliceString = function(idx, rem, str) {
		return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
	};


}


module.exports = {Time,StringUtil};