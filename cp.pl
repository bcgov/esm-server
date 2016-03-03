#!/usr/bin/perl


my $from = $ARGV[0];
my $to = $ARGV[1];

my $oldSmall = $ARGV[2];
my $newSmall = $ARGV[3];

my $oldCapitalized = $ARGV[4];
my $newCapitalized = $ARGV[5];
my $testonly = $ARGV[6] || 0;

my $hyphen = '-'.$newSmall.'-';
my $ohyphen = "-condition-";

$newSmall =~ s/\-//g;



`rm -rf modules/$to`;


# print "$from, $to, $oname, $nname\n";

if ($testonly) {
	print "mv $from $to\n";
	print "\ts/$ohyphen/$hyphen/g\n";
	print "\ts/$oldSmall/$newSmall/g\n";
	print "\ts/$oldCapitalized/$newCapitalized/g\n";
	exit ;
}
`rm -rf modules/$to`;
`cp -R modules/$from modules/$to`;
use File::Find;
$dir = "modules/$to";
find(\&edits, $dir);
sub edits() {
	# print "File name is $_\n\t\tFull path is $File::Find::name\n" if -f;
	if (-f) {
		my $oldname = $_;
		my $newname = $oldname;
		$newname =~ s/$oldSmall/$newSmall/ge;
		if ($testonly) {
			print "mv $oldname $newname\n";
			print "\tperl -pi -w -e 's/$oldSmall/$newSmall/g;' $newname\n";
			print "\tperl -pi -w -e 's/$oldCapitalized/$newCapitalized/g;' $newname\n";
		} else {
			print "mv $oldname $newname  \n";
			`mv $oldname $newname`;
			`perl -pi -w -e 's/$ohyphen/$hyphen/g;' $newname`;
			`perl -pi -w -e 's/$oldSmall/$newSmall/g;' $newname`;
			`perl -pi -w -e 's/$oldCapitalized/$newCapitalized/g;' $newname`;
		}
	}
}


# `rm -rf modules/$to`;

exit (0);
