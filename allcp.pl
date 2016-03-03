#!/usr/bin/perl

my $testonly = 0;
my %list = (
	org                   =>      'Org'                ,
	contact               =>      'Contact'            ,
	complaint             =>      'Complaint'          ,
	order                 =>      'Order'              ,
	vc                    =>      'Vc'                 ,
	'project-condition'   =>      'ProjectCondition'   ,
	ir                    =>      'Ir'                 ,
	'project-document'    =>      'ProjectDocument'    ,
	'project-description' =>      'ProjectDescription' ,
	description           =>      'Description'        ,
);

foreach my $lowercase (keys %list) {
	my $uppercase = $list{$lowercase};
	print "conditions $lowercase condition $lowercase Condition $uppercase $testonly\n";
	system ("perl cp.pl conditions $lowercase"."s condition $lowercase Condition $uppercase $testonly");
}

exit (0);

